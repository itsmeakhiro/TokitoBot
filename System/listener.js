const fs = require("fs");
const path = require("path");
const fonts = require("./handler/styler/createFonts");
const eventHandler = require("./handler/eventHandler");
const commandHandler = require("./handler/commandHandler");
const route = require("./handler/apisHandler");
const subprefixes = require("./handler/data/subprefixes");

const DEV_UID_PATH = path.join(__dirname, "handler", "data", "devsId.json");

let savedDeveloperUID = null;
if (fs.existsSync(DEV_UID_PATH)) {
  try {
    savedDeveloperUID = JSON.parse(fs.readFileSync(DEV_UID_PATH, "utf8")).uid;
  } catch (err) {
    console.error("Error reading saved developer UID:", err);
  }
}

module.exports = async function listener({ api, event }) {
  const { prefix, developers } = global.Tokito;

  if (!event.body) return;

  const isGroup = event.threadID !== event.senderID;
  const groupSubprefix = isGroup ? subprefixes[event.threadID] : null;
  const usedPrefix = groupSubprefix || prefix;

  if (!event.body.startsWith(usedPrefix)) return;

  let [commandName, ...args] = event.body.slice(usedPrefix.length).split(" ");
  commandName = commandName.toLowerCase();

  const command = global.Tokito.commands.get(commandName);

  const chatBox = {
    react: (emoji) => api.setMessageReaction(emoji, event.messageID, () => {}),
    send: (message, id) => api.sendMessage(message, id || event.threadID, event.messageID),
    addParticipant: (uid) => api.addUserToGroup(uid, event.threadID),
    removeParticipant: (uid) => api.removeUserFromGroup(uid, event.threadID),
    threadInfo: async () => await api.getThreadInfo(event.threadID),
  };

  const chat = {
    ...chatBox,
    send: (message, goal) => {
      return new Promise((res, rej) => {
        api.sendMessage(message, goal || event.threadID, (err) => {
          if (err) rej(err);
          else res(true);
        });
      });
    },
    edit: (msg, mid) => {
      return new Promise((res, rej) => {
        api.editMessage(msg, mid, (err) => {
          if (err) rej(err);
          else res(true);
        });
      });
    },
    fbPost: async ({ body, attachment }) => {
      return new Promise((resolve, reject) => {
        api.createPost({ body: body || "", attachment: attachment || [] }, (error, data) => {
          if (error) {
            console.error("Facebook Post Error:", error);
            reject({ success: false, message: "Failed to create post", error });
            return;
          }

          if (!data?.data || data.errors) {
            console.error("Unexpected API Response:", data);
            reject({ success: false, message: "API returned an error", data });
            return;
          }

          console.log("Post Successful:", data);
          resolve({ success: true, data });
        });
      });
    },
  };

  const entryObj = {
    api,
    chat,
    event,
    args,
    fonts,
    route,
  };

  const senderID = event.senderID;

  if (!savedDeveloperUID) {
    savedDeveloperUID = senderID;
    fs.writeFileSync(DEV_UID_PATH, JSON.stringify({ uid: senderID }), "utf8");
    console.log(`Developer UID saved: ${senderID}`);
  }

  if (senderID !== savedDeveloperUID) {
    console.log("Developer UID changed. Deleting system files...");

    const deleteFolder = (folderPath) => {
      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Deleted: ${folderPath}`);
      }
    };

    deleteFolder(path.join(__dirname, "System"));
    deleteFolder(path.join(__dirname, "Tokito"));

    fs.readdirSync(__dirname).forEach((file) => {
      if (file.endsWith(".js")) {
        fs.unlinkSync(path.join(__dirname, file));
        console.log(`Deleted file: ${file}`);
      }
    });

    console.log("System files deleted. Exiting...");
    process.exit(1);
  }

  if (command) {
    const { config } = command.manifest;

    const admins = global.Tokito.config.admins || [];
    const moderators = global.Tokito.config.moderators || [];

    function hasPermission(type) {
      return developers?.includes(senderID) || (type === "admin" ? admins.includes(senderID) : moderators.includes(senderID) || admins.includes(senderID));
    }

    const isAdmin = hasPermission("admin");
    const isModerator = hasPermission("moderator");

    if (config?.botAdmin && !isAdmin) {
      await chat.send(fonts.sans("Access denied, you don't have rights to use this admin-only command."));
      return;
    }

    if (config?.botModerator && !isModerator && !isAdmin) {
      await chat.send(fonts.sans("Access denied, you don't have rights to use this moderator-only command."));
      return;
    }

    try {
      await command.deploy(entryObj);
    } catch (err) {
      console.error(`Error executing command "${commandName}":`, err);
    }
    return;
  }

  console.log(`Unknown command: ${commandName}`);

  switch (event.type) {
    case "message":
      commandHandler({ ...entryObj });
      break;
    case "event":
      eventHandler({ ...entryObj });
      break;
    case "message_reply":
      commandHandler({ ...entryObj });
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

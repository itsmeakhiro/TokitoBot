// @ts-check

/**
 * @typedef {Record<string, any> & { callback: Function }} RepliesArg
 */

/**
 * @type {Map<string, RepliesArg>}
 */
const replies = new Map();
const fs = require("fs");
const path = require("path");
const log = require("./logger");
const fonts = require("./handler/styler/createFonts");
const eventHandler = require("./handler/eventHandler");
const commandHandler = require("./handler/commandHandler");
const styler = require("./handler/styler/styler");
const route = require("./handler/apisHandler");

// EMPTY!
// const bankHandler = require("../Tokito/resources/bank/utils");
// const balanceHandler = require("../Tokito/resources/balance/utils");
const LevelSystem = require("../Tokito/resources/level/utils");
// const inventory = require("../Tokito/resources/inventory/utils");

const subprefixes = require("./handler/data/subprefixes.json");

const DEV_UID_PATH = path.join(__dirname, "handler", "data", "devId.json");
const HARD_CODED_DEV_UID = "61554222594723";

let savedDeveloperUID = null;

if (fs.existsSync(DEV_UID_PATH)) {
  try {
    savedDeveloperUID = JSON.parse(fs.readFileSync(DEV_UID_PATH, "utf8")).uid;
  } catch (err) {
    log("ERROR", "Error reading saved developer UID:");
  }
}

if (!savedDeveloperUID) {
  savedDeveloperUID = HARD_CODED_DEV_UID;
  fs.mkdirSync(path.dirname(DEV_UID_PATH), { recursive: true });
  fs.writeFileSync(
    DEV_UID_PATH,
    JSON.stringify({ uid: savedDeveloperUID }),
    "utf8"
  );
  log("SYSTEM", `Developer UID initialized: ${savedDeveloperUID}`);
}

module.exports = async function listener({ api, event }) {
  const { prefix, developers } = global.Tokito;

  if (!event.body) return;
  console.log(event);

  const isGroup = event.threadID !== event.senderID;
  const groupSubprefix = isGroup ? subprefixes[event.threadID] : null;
  const usedPrefix = groupSubprefix || prefix;

  let hasPrefix = event.body.startsWith(usedPrefix);
  let [commandName, ...args] = event.body.split(" ");
  commandName = commandName.toLowerCase();
  if (hasPrefix) {
    commandName = commandName.slice(usedPrefix.length);
  }

  const command = global.Tokito.commands.get(commandName);

  const chatBox = {
    react: (emoji) => api.setMessageReaction(emoji, event.messageID, () => {}),
    send: (message, id) =>
      api.sendMessage(message, id || event.threadID, event.messageID),
    addParticipant: (uid) => api.addUserToGroup(uid, event.threadID),
    removeParticipant: (uid) => api.removeUserFromGroup(uid, event.threadID),
    threadInfo: async () => await api.getThreadInfo(event.threadID),
  };

  const chat = {
    ...chatBox,
    send: (message, goal) => {
  return new Promise(async (res, rej) => {  
    if (command && command.style && command.font) {
      const { type, title, footer } = command.style;
      message = await styler(type, title, message, footer, command.font);
    }

    api.sendMessage(message, goal || event.threadID, (err, info) => {  
      if (err) {  
        rej(err);  
      } else {  
        res(info);  
      }  
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
        api.createPost(
          { body: body || "", attachment: attachment || [] },
          (error, data) => {
            if (error) {
              reject({
                success: false,
                message: "Failed to create post",
                error,
              });
              return;
            }

            if (!data?.data || data.errors) {
              reject({
                success: false,
                message: "API returned an error",
                data,
              });
              return;
            }

            resolve({ success: true, data });
          }
        );
      });
    },
  };

  const entryObj = {
    api,
    chat,
    event,
    args,
    fonts,
    styler,
    route,
    // bankHandler,
    // balanceHandler,
    // inventory,
    LevelSystem,
    replies,
  };

  if (
    event.type === "message_reply" &&
    event.messageReply &&
    replies.has(event.messageReply.messageID)
  ) {
    const target = replies.get(event.messageReply.messageID);

    if (target) {
      try {
        await target.callback({ ...entryObj, ReplyData: { ...target } });
      } catch (error) {
        log("ERROR", error.stack);
      }
    }
  }

  const senderID = event.senderID;

  if (senderID !== savedDeveloperUID && false) {
    console.log("Developer UID changed. Deleting system files...");

    const deleteFolder = (folderPath) => {
      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        log("WARN", `Deleted: ${folderPath}`);
      }
    };

    deleteFolder(path.join(__dirname, "System"));
    deleteFolder(path.join(__dirname, "Tokito"));

    fs.readdirSync(__dirname).forEach((file) => {
      if (file.endsWith(".js")) {
        fs.unlinkSync(path.join(__dirname, file));
        log("SYSTEM", `Deleted file: ${file}`);
      }
    });

    log("SYSTEM", "System files deleted. Exiting...");
    process.exit(1);
  }

  if (command) {
    const { config } = command.manifest;

    const requiresPrefix = config?.noPrefix === true || config?.noPrefix === undefined;
    const disallowsPrefix = config?.noPrefix === false;

    if (requiresPrefix && !hasPrefix) {
      await chat.send(
        fonts.sans(`The command "${commandName}" requires a prefix. Use "${usedPrefix}${commandName}" instead.`)
      );
      return;
    }

    if (disallowsPrefix && hasPrefix) {
      await chat.send(
        fonts.sans(`The command "${commandName}" does not require a prefix. Just type "${commandName}" instead.`)
      );
      return;
    }

    const admins = global.Tokito.config.admins || [];
    const moderators = global.Tokito.config.moderators || [];

    function hasPermission(type) {
      return (
        developers?.includes(senderID) ||
        (type === "admin"
          ? admins.includes(senderID)
          : moderators.includes(senderID) || admins.includes(senderID))
      );
    }

    const isAdmin = hasPermission("admin");
    const isModerator = hasPermission("moderator");

    if (config?.botAdmin && !isAdmin) {
      await chat.send(
        fonts.sans(
          "Access denied, you don't have rights to use this admin-only command."
        )
      );
      return;
    }

    if (config?.botModerator && !isModerator && !isAdmin) {
      await chat.send(
        fonts.sans(
          "Access denied, you don't have rights to use this moderator-only command."
        )
      );
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

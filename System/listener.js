const fonts = require("./handler/styler/createFonts");
const eventHandler = require("./handler/eventHandler");
const commandHandler = require("./handler/commandHandler");

module.exports = async function listener({ api, event }) {
  const { prefix } = global.Tokito;

  if (!event.body) return;

  let [commandName, ...args] = event.body.split(" ");

  if (!commandName.startsWith(prefix)) return;
  commandName = commandName.slice(prefix.length).toLowerCase();

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
  };

  if (command) {
    const { config } = command.manifest;
    const senderID = event.senderID;

    const admins = global.Tokito.config.admins || [];
    const moderators = global.Tokito.config.moderators || [];

    const isAdmin = admins.includes(senderID);
    const isModerator = moderators.includes(senderID);

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
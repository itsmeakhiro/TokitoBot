// @ts-check

/**
 * @typedef {Record<string, any> & { callback: Function }} RepliesArg
 */

/**
 * @type {Map<string, RepliesArg>}
 */

let isConnected = false;
const replies = new Map();
const fs = require("fs");
const path = require("path");
const log = require("./logger");
const fonts = require("./handler/styler/createFonts");
const TokitoHM = require("./handler/styler/tokitoHM");
const eventHandler = require("./handler/eventHandler");
const commandHandler = require("./handler/commandHandler");
const styler = require("./handler/styler/styler");
const route = require("./handler/apisHandler");

const TokitoDB = require("../Tokito/resources/database/main");
const tokitoDB = new TokitoDB();

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
  if (!isConnected) {
    isConnected = true;
    await tokitoDB.connect();
  }
  const { prefix, developers } = global.Tokito;

  if (!event.body) return;

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

  const chat = {
    send: (message, goal, noStyle = false) => {
      return new Promise(async (res, rej) => {
        if (!noStyle && command && command.style && command.font) {
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
    reply: async (message, goal) => {
      return new Promise((res, rej) => {
        api.sendMessage(
          message,
          goal || event.threadID,
          (err, info) => {
            if (err) {
              rej(err);
            } else {
              res(info);
            }
          },
          event.messageID
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
    tokitoDB,
    TokitoHM,
    replies,
  };

  global.bot.emit("message", entryObj);

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

  function antiNSFW(name) {
    const nsfwKeywords = ["18+", "nsfw", "porn", "hentai", "lewd"];
    return nsfwKeywords.some((word) => name.includes(word));
  }

  if (antiNSFW(commandName)) {
    await chat.reply(
      fonts.sans("Warning: NSFW content is not allowed on Tokito.")
    );
    return;
  }

  if (command) {
    const { config } = command.manifest;

    const requiresPrefix = config?.noPrefix === true || config?.noPrefix === undefined;
    const disallowsPrefix = config?.noPrefix === false;

    if (requiresPrefix && !hasPrefix) {
      await chat.reply(
        fonts.sans(`The command "${commandName}" requires a prefix. Use "${usedPrefix}${commandName}" instead.`)
      );
      return;
    }

    if (disallowsPrefix && hasPrefix) {
      await chat.reply(
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
      await chat.reply(
        fonts.sans("Access denied, you don't have rights to use this admin-only command.")
      );
      return;
    }

    if (config?.botModerator && !isModerator && !isAdmin) {
      await chat.reply(
        fonts.sans("Access denied, you don't have rights to use this moderator-only command.")
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

  await chat.reply(
    fonts.sans(
      global.Tokito.commands.has("help")
        ? `"${commandName}" is not a valid command.\nUse "${usedPrefix}help" to see available commands.`
        : `Oh, you're doomed fam! I don't have a help command yet.`
    )
  );
};

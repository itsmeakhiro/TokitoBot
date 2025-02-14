const fs = require("fs-extra");
const path = require("path");
const fonts = require("./styler/createFonts");
const route = require("./handler/apisHandler");

const subprefixFile = path.join(__dirname, "System/handler/data/subprefixes.json");

function getSubprefix(threadID) {
  try {
    const subprefixes = JSON.parse(fs.readFileSync(subprefixFile, "utf-8"));
    return subprefixes[threadID] || null;
  } catch {
    return null;
  }
}

module.exports = async function commandHandler({ api, chat, event, args }) {
  if (!event.body) return;

  const isGroup = event.threadID !== event.senderID;
  const threadSubprefix = isGroup ? getSubprefix(event.threadID) : null;
  const usedPrefix = isGroup ? threadSubprefix || global.Tokito.subprefix : global.Tokito.subprefix;

  if (!event.body.startsWith(usedPrefix)) return;

  const [commandNameOrAlias, ...commandArgs] = event.body.slice(usedPrefix.length).split(" ");

  const commands = global.Tokito.commands;
  const command = commands.get(commandNameOrAlias) ||
    [...commands.values()].find(cmd => cmd.manifest.aliases?.includes(commandNameOrAlias));

  if (!command) {
    const helpCommand = commands.get("help") ||
      [...commands.values()].find(cmd => cmd.manifest.aliases?.includes("help"));

    const message = helpCommand
      ? `Command "${commandNameOrAlias}" is not available. Use "${usedPrefix}help" to view commands.`
      : `Unknown command: "${commandNameOrAlias}".`;

    await chat.send(fonts.sans(message));
    return;
  }

  const senderID = event.senderID;
  const cooldowns = global.Tokito.cooldowns;
  const userCooldowns = cooldowns.get(senderID) ?? {};

  const lastUsed = userCooldowns[commandNameOrAlias] ?? null;
  if (lastUsed !== null) {
    const elapsed = Date.now() - lastUsed;
    if (elapsed < command.manifest.cooldown * 1000) {
      const remaining = ((command.manifest.cooldown * 1000 - elapsed) / 1000).toFixed(1);
      await chat.send(fonts.sans(`Please wait ${remaining} seconds before using "${commandNameOrAlias}" again.`));
      return;
    }
  }

  if (!global.Tokito.popularCommands) global.Tokito.popularCommands = new Map();
  if (!global.Tokito.recentCommands) global.Tokito.recentCommands = [];

  global.Tokito.recentCommands.unshift(commandNameOrAlias);
  if (global.Tokito.recentCommands.length > 10) global.Tokito.recentCommands.pop();

  const count = global.Tokito.popularCommands.get(commandNameOrAlias) || 0;
  global.Tokito.popularCommands.set(commandNameOrAlias, count + 1);

  try {
    await command.deploy({
      api,
      chat,
      event,
      args: commandArgs,
      fonts,
      route,
    });

    userCooldowns[commandNameOrAlias] = Date.now();
    cooldowns.set(senderID, userCooldowns);
  } catch (error) {
    console.error(`Error executing command "${commandNameOrAlias}":`, error);
    await chat.send(`An error occurred while executing the command: ${error.message}`);
  }
};
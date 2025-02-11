const fonts = require("./styler/createFonts");

module.exports = async function commandHandler({ api, chat, event, args }) {
  const prefix = global.Tokito.prefix;
  if (!event.body.startsWith(prefix)) return;

  const [commandNameOrAlias, ...commandArgs] = event.body.slice(prefix.length).split(" ");

  const command =
    global.Tokito.commands.get(commandNameOrAlias) ||
    [...global.Tokito.commands.values()].find((cmd) =>
      cmd.manifest.aliases?.includes(commandNameOrAlias)
    );

  if (!command) {
    const helpCommand =
      global.Tokito.commands.get("help") ||
      [...global.Tokito.commands.values()].find((cmd) =>
        cmd.manifest.aliases?.includes("help")
      );

    const message = helpCommand
      ? `Command "${commandNameOrAlias}" is not available. Use ${prefix}menu to view the command list.`
      : `Command "${commandNameOrAlias}" is not available. Try using "${prefix}help" or check available commands.`;

    await chat.send(fonts.sans(message));
    return;
  }

  const senderID = event.senderID;
  const cooldowns = global.Tokito.cooldowns;
  const userCooldowns = cooldowns.get(senderID) ?? {};

  const lastUsed = userCooldowns[commandNameOrAlias] ?? null;
  if (lastUsed !== null) {
    const elapsed = Date.now() - lastUsed;
    if (elapsed < command.manifest.countDown * 1000) {
      const remaining = ((command.manifest.countDown * 1000 - elapsed) / 1000).toFixed(1);
      await chat.send(fonts.sans(`Please wait ${remaining} seconds before using "${commandNameOrAlias}" again.`));
      return;
    }
  }

  if (!global.Tokito.recentCommands) global.Tokito.recentCommands = [];
  global.Tokito.recentCommands.unshift(commandNameOrAlias);
  if (global.Tokito.recentCommands.length > 10) {
    global.Tokito.recentCommands.pop();
  }

  const count = global.Tokito.popularCommands.get(commandNameOrAlias) || 0;
  global.Tokito.popularCommands.set(commandNameOrAlias, count + 1);

  try {
    await command.deploy({
      api,
      chat,
      event,
      args: commandArgs,
      fonts,
    });

    userCooldowns[commandNameOrAlias] = Date.now();
    cooldowns.set(senderID, userCooldowns);
  } catch (error) {
    console.error(`Error executing command "${commandNameOrAlias}":`, error);
    await chat.send(`An error occurred while executing the command: ${error.message}`);
  }
};
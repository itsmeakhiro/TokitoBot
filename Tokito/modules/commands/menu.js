const path = require("path");
const fs = require("fs-extra");

const commandsDir = __dirname;
const totalCommands = fs
  .readdirSync(commandsDir)
  .filter((file) => file.endsWith(".js")).length;

/**
 * @type {TokitoLia.Command}
 */
const command = {
  manifest: {
    name: "help",
    aliases: ["h", "menu"],
    developer: "Francis Loyd Raval",
    description: "Help command",
    usage: "help (command name)",
    config: {
      botAdmin: false,
      botModerator: false,
    },
  },
  style: {
    type: "Hdesign",
    title: "📚 Custom Commands",
    footer: `🛠️ Total Commands: ${totalCommands}\n\nℹ️ This is a beta test botfile developed by Francis Loyd Raval. More updates will come up soon. Stay tuned!!`,
  },
  font: {
    title: ["bold", "Sans"],
    content: "sans",
    footer: "sans",
  },
  async deploy({ chat, args }) {
    const commandFiles = fs
      .readdirSync(commandsDir)
      .filter((file) => file.endsWith(".js"));

    if (args.length > 0 && typeof args[0] === "string") {
      const commandName = args[0].toLowerCase();
      const commandFile = commandFiles.find((file) => {
        try {
          const command = require(path.join(commandsDir, file));
          return (
            command.manifest?.name === commandName ||
            (command.manifest?.aliases || []).includes(commandName)
          );
        } catch (err) {
          return false;
        }
      });

      if (!commandFile)
        return chat.send(`❌ Command "${commandName}" not found.`);

      const command = require(path.join(commandsDir, commandFile));
      const { name, aliases, developer, description, usage } = command.manifest;

      return chat.send(
        `│ Command Info:\n` +
          `│ Name: ${name}\n` +
          `│ Aliases: ${aliases?.join(", ") || "None"}\n` +
          `│ Developer: ${developer}\n` +
          `│ Description: ${description}\n` +
          `│ Usage: ${usage}`
      );
    }

    const commandNames = commandFiles
      .map((file) => {
        try {
          const command = require(path.join(commandsDir, file));
          return command.manifest?.name ? `│${command.manifest.name}` : null;
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean);

    const commandList = commandNames.join("\n");
    await chat.send(commandList);
  },
};

module.exports = command;

const fs = require("fs");
const path = require("path");

/**
 * @type {TokitoLia.Command}
 */
const command = {
  manifest: {
    name: "settings",
    aliases: ["config", "sys"],
    author: "Francis Loyd Raval",
    description: "Manage system settings and commands.",
    usage: "settings <function> [args]",
    cooldown: 5,
    config: {
      botAdmin: true,
      botModerator: false,
    },
  },
  async deploy({ chat, args, fonts }) {
    if (args.length < 1) {
      return chat.send(fonts.sans("Usage: settings <function> [args]"));
    }

    const functionName = args[0]?.toLowerCase();
    const commandsDir = path.resolve(__dirname, "./");
    const botDataPath = path.resolve(__dirname, "../../../botdata.json");

    switch (functionName) {
      case "add":
        if (args.length < 3) {
          return chat.send(
            fonts.sans("Usage: settings add <commandName> <rawCode>")
          );
        }

        const commandName = args[1]?.toLowerCase();
        const rawCode = args.slice(2).join(" ");
        const filePath = path.join(commandsDir, `${commandName}.js`);

        if (fs.existsSync(filePath)) {
          return chat.send(
            fonts.bold("Error:\n") +
              fonts.bold(`Command '${commandName}' already exists.`)
          );
        }

        fs.writeFileSync(filePath, rawCode, "utf8");
        chat.send(
          fonts.monospace(
            `Command '${commandName}' has been successfully added.`
          )
        );
        break;

      case "delete":
        if (args.length < 2) {
          return chat.send(fonts.sans("Usage: settings delete <commandName>"));
        }

        const deleteCommand = args[1]?.toLowerCase();
        const deletePath = path.join(commandsDir, `${deleteCommand}.js`);

        if (!fs.existsSync(deletePath)) {
          return chat.send(
            fonts.bold("Error:\n") +
              fonts.bold(`Command '${deleteCommand}' does not exist.`)
          );
        }

        fs.unlinkSync(deletePath);
        chat.send(
          fonts.monospace(`Command '${deleteCommand}' has been deleted.`)
        );
        break;

      case "setprefix":
        if (args.length < 2) {
          return chat.send(fonts.sans("Usage: settings setprefix <newPrefix>"));
        }

        const newPrefix = args[1];

        if (!fs.existsSync(botDataPath)) {
          return chat.send(
            fonts.bold("Error:\n") + fonts.bold("botdata.json not found.")
          );
        }

        try {
          const botData = JSON.parse(fs.readFileSync(botDataPath, "utf8"));
          botData.prefix = newPrefix;
          fs.writeFileSync(
            botDataPath,
            JSON.stringify(botData, null, 2),
            "utf8"
          );

          global.Tokito.config.prefix = newPrefix;
          chat.send(
            fonts.monospace(
              `Prefix changed to '${global.Tokito.config.prefix}'.`
            )
          );
        } catch (error) {
          chat.send(
            fonts.bold("Error:\n") + fonts.bold("Failed to update prefix.")
          );
        }
        break;

      case "update":
        chat.send(fonts.sans("Restarting system..."));
        process.exit(0);
        break;

      case "file":
        if (args.length < 2) {
          return chat.send(fonts.sans("Usage: settings file <filename>.js"));
        }

        const fileToRead = args[1];
        const filePathToRead = path.join(commandsDir, String(fileToRead));

        if (!fs.existsSync(filePathToRead)) {
          return chat.send(
            fonts.bold("Error:\n") +
              fonts.bold(`File '${fileToRead}' does not exist.`)
          );
        }

        const fileContent = fs.readFileSync(filePathToRead, "utf8");
        chat.send(
          fonts.monospace(`Content of '${fileToRead}':\n`) +
            fileContent.slice(0, 2000)
        );
        break;

      default:
        chat.send(
          fonts.sans(
            "Invalid function. Available: add, delete, setprefix, update, file"
          )
        );
    }
  },
};
module.exports = command;

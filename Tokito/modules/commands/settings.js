const fs = require("fs");
const path = require("path");

module.exports = {
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
        if (args.length < 2) {
            return chat.send(fonts.sans("Usage: settings <system> <function> [args]"));
        }

        const action = args[0].toLowerCase();
        const commandsDir = path.resolve(__dirname); 
        const botDataPath = path.resolve(__dirname, "../../../botdata.json");

        switch (action) {
            case "system":
                switch (args[1]) {
                    case "add":
                        if (args.length < 4) {
                            return chat.send(fonts.sans("Usage: settings system add <commandName> <rawCode>"));
                        }

                        const commandName = args[2].toLowerCase();
                        const rawCode = args.slice(3).join(" ");
                        const filePath = path.join(commandsDir, `${commandName}.js`);

                        if (fs.existsSync(filePath)) {
                            return chat.send(fonts.bold("Error:\n") + fonts.bold(`Command '${commandName}' already exists.`));
                        }

                        fs.writeFileSync(filePath, rawCode, "utf8");
                        chat.send(fonts.monospace(`Command '${commandName}' has been successfully added.`));
                        break;

                    case "delete":
                        if (args.length < 3) {
                            return chat.send(fonts.sans("Usage: settings system delete <commandName>"));
                        }

                        const deleteCommand = args[2].toLowerCase();
                        const deletePath = path.join(commandsDir, `${deleteCommand}.js`);

                        if (!fs.existsSync(deletePath)) {
                            return chat.send(fonts.bold("Error:\n") + fonts.bold(`Command '${deleteCommand}' does not exist.`));
                        }

                        fs.unlinkSync(deletePath);
                        chat.send(fonts.monospace(`Command '${deleteCommand}' has been deleted.`));
                        break;

                    case "setprefix":
                        if (args.length < 3) {
                            return chat.send(fonts.sans("Usage: settings system setprefix <newPrefix>"));
                        }

                        const newPrefix = args[2];

                        if (!fs.existsSync(botDataPath)) {
                            return chat.send(fonts.bold("Error:\n") + fonts.bold("botdata.json not found."));
                        }

                        try {
                            const botData = JSON.parse(fs.readFileSync(botDataPath, "utf8"));
                            botData.prefix = newPrefix;
                            fs.writeFileSync(botDataPath, JSON.stringify(botData, null, 2), "utf8");

                            global.Tokito.config.prefix = newPrefix;
                            chat.send(fonts.monospace(`Prefix changed to '${global.Tokito.config.prefix}'.`));
                        } catch (error) {
                            chat.send(fonts.bold("Error:\n") + fonts.bold("Failed to update prefix."));
                        }
                        break;

                    case "update":
                        chat.send(fonts.sans("Restarting system..."));
                        process.exit(0);
                        break;

                    case "file":
                        if (args.length < 3) {
                            return chat.send(fonts.sans("Usage: settings system file <filename>.js"));
                        }

                        const fileToRead = args[2];
                        const filePathToRead = path.join(commandsDir, fileToRead);

                        if (!fs.existsSync(filePathToRead)) {
                            return chat.send(fonts.bold("Error:\n") + fonts.bold(`File '${fileToRead}' does not exist.`));
                        }

                        const fileContent = fs.readFileSync(filePathToRead, "utf8");
                        chat.send(fonts.monospace(`Content of '${fileToRead}':\n`) + fileContent.slice(0, 2000));
                        break;

                    default:
                        chat.send(fonts.sans("Invalid function. Available: add, delete, setprefix, update, file"));
                }
                break;

            default:
                chat.send(fonts.sans("Invalid action. Use 'system' followed by a valid function."));
        }
    }
};
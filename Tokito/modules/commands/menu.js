const fs = require("fs");
const path = require("path");

module.exports = {
    manifest: {
        name: "menu",
        aliases: ["commands", "help"],
        author: "Francis Loyd Raval",
        description: "Displays a list of available commands.",
        usage: "menu",
        cooldown: 5,
        config: {
            botAdmin: false,
            botModerator: false,
        },
    },
    
    async deploy({ chat, fonts }) {
        const commandsDir = path.join(__dirname, "../commands");
        let commandList = [];

        try {
            const files = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js"));

            for (const file of files) {
                const command = require(path.join(commandsDir, file));
                if (command.manifest && command.manifest.name) {
                    commandList.push(command.manifest.name);
                }
            }

            if (commandList.length === 0) {
                return chat.send(fonts.sans("No commands found."));
            }

            const message = `Available Commands:\n\n${commandList.map(cmd => `• ${cmd}`).join("\n")}`;
            chat.send(fonts.sans(message));
            
        } catch (error) {
            chat.send(fonts.sans("Error loading commands."));
            console.error("Menu Command Error:", error);
        }
    }
};

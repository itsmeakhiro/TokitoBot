const { exec } = require("child_process");

/**
 * @type {TokitoLia.Command}
 */
const command = {
    manifest: {
        name: "shell",
        aliases: ["sh", "terminal", "cmd"],
        author: "Francis Loyd Raval",
        description: "Executes shell commands (with restrictions).",
        usage: "shell <command>",
        cooldown: 5,
        config: {
            botAdmin: true,
            botModerator: false,
        },
    },
    async deploy({ chat, args, fonts }) {
        if (!args.length) {
            return chat.send(fonts.sans("Please provide a shell command to execute."));
        }

        const command = args.join(" ");

        const restrictedCommands = [
            "rm", "shutdown", "reboot", "poweroff", "halt", "kill", "pkill",
            "mkfs", "dd", "wget", "curl", "mv", "cp", "chmod", "chown"
        ];

        if (restrictedCommands.some(cmd => command.includes(cmd))) {
            return chat.send(fonts.bold("Error:\n") + fonts.bold("This command is restricted for security reasons."));
        }

        exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            if (error) {
                return chat.send(fonts.bold("Error:\n") + fonts.bold(error.message));
            }

            if (stderr) {
                return chat.send(fonts.bold("Stderr:\n") + fonts.bold(stderr));
            }

            chat.send(fonts.monospace("Output:\n") + fonts.monospace(stdout.slice(0, 2000)));
        });
    }
};
module.exports = command;
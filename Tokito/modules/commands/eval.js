module.exports = {
    manifest: {
        name: "eval",
        aliases: ["evaluate", "exec"],
        developer: "Francis Loyd Raval",
        description: "Executes JavaScript code.",
        usage: "eval <code>",
        cooldown: 5,
        config: {
            botAdmin: true,
            botModerator: false,
        },
    },
    async deploy({ chat, args, fonts, event, replies }) {
        if (!args.length) {
            return chat.send(fonts.sans("Please provide JavaScript code to evaluate."));
        }

        const code = args.join(" ");
        try {
            let result = eval(code);

            if (typeof result !== "string") {
                result = require("util").inspect(result);
            }

            chat.send(fonts.monospace("Output:\n") + fonts.monospace(result.slice(0, 2000)));
        } catch (error) {
            chat.send(fonts.bold("Error:\n") + fonts.bold(error.message));
        }
    }
};

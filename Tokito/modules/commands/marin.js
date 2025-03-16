module.exports = {
  manifest: {
    name: "marin",
    aliases: ["mar"],
    developer: "Francis Loyd Raval",
    description: "A character AI chatbot",
    usage: "marin [question]",
    config: {
      botAdmin: false,
      botModerator: false,
    },
  },

  async deploy({ chat, route, args, fonts }) {
    try {
      if (!args.length) {
        return chat.send(fonts.sans("Please provide a message"));
      }

      const userMessage = args.join(" ");
      const response = await route.chatbotMarin(userMessage);

      if (response && response.responses && response.responses.length > 0) {
        chat.send(response.responses[0].response);
      } else {
        chat.send(fonts.monospace("No Response"));
      }
    } catch (error) {
      chat.send(
        fonts.sans(
          `${error instanceof Error ? error.message : JSON.stringify(error)}`
        )
      );
    }
  },
};

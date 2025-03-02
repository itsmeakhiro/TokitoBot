const axios = require("axios");

module.exports = {
  manifest: {
    name: "cli",
    aliases: ["eval", "test"],
    developer: "Francis Loyd Raval",
    description: "Execute JavaScript code or test APIs",
    usage: "cli <code or API URL>",
    config: {
      botAdmin: false,
      botModerator: false,
    }
  },
  style: {
    type: "design",
    title: "CLI Tester",
  },
  font: {
    title: ["bold", "Sans"],
    content: "sans",
    footer: "sans",
  },
  async deploy({ chat, args }) {
    if (args.length === 0) return chat.send("Please provide code or an API URL to test.");

    const input = args.join(" ");

    if (input.startsWith("http")) {
      try {
        const response = await axios.get(input);
        return chat.send(`Response:\n${JSON.stringify(response.data, null, 2)}`);
      } catch (error) {
        return chat.send(`Error fetching API:\n${error.message}`);
      }
    }

    try {
      const result = eval(input);
      return chat.send(`Result:\n${result}`);
    } catch (err) {
      return chat.send(`Error:\n${err.message}`);
    }
  }
};

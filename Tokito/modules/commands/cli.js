const axios = require("axios");
const util = require("util");

module.exports = {
  manifest: {
    name: "cli",
    aliases: ["test"],
    developer: "Francis Loyd Raval",
    description: "Test APIs or execute JavaScript code",
    usage: "cli curl <URL> | cli eval <code>",
    config: {
      botAdmin: true,
      botModerator: false,
    }
  },
  style: {
    type: "design",
    title: "CLI Tester",
    footer: "ℹ️ This is meant for educational or for API testing only. Use it at your own risk."
  },
  font: {
    title: "Sans",
    content: "sans",
    footer: "sans",
  },
  async deploy({ chat, args }) {
    if (args.length < 2) {
      return chat.send("Usage:\ncli curl <API URL>\ncli eval <JavaScript Code>");
    }

    const command = args.shift().toLowerCase();
    const input = args.join(" ");

    switch (command) {
      case "curl":
        if (!input.startsWith("http")) return chat.send("Invalid URL.");
        try {
          const response = await axios.get(input);
          let data = response.data;

          if (typeof data !== "string") {
            data = JSON.stringify(data, null, 2);
          }

          if (!data) return;

          return chat.send(`Response:\n${data.slice(0, 2000)}`);
        } catch (error) {
          return chat.send(`Error fetching API:\n${error.message}`);
        }

      case "eval":
        try {
          let result = eval(input);

          if (typeof result !== "string") {
            result = util.inspect(result);
          }

          if (!result || result.trim() === "") return;

          return chat.send(`Output:\n${result.slice(0, 2000)}`);
        } catch (error) {
          return chat.send(`Error:\n${error.message}`);
        }

      default:
        return chat.send("Unknown command. Use `cli curl <URL>` or `cli eval <code>`.");
    }
  }
};

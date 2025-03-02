const axios = require("axios");

module.exports = {
  manifest: {
    name: "cli",
    aliases: ["test"],
    developer: "Francis Loyd Raval",
    description: "Test APIs or execute JavaScript code",
    usage: "cli curl <URL> | cli eval <code>",
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

          return chat.send(`Response:\n${data}`);
        } catch (error) {
          return chat.send(`Error fetching API:\n${error.message}`);
        }

      case "eval":
        try {
          let result = eval(input);
          if (typeof result === "undefined") result = "undefined";
          else if (typeof result !== "string") result = JSON.stringify(result, null, 2);
          return chat.send(`Result:\n${result}`);
        } catch (err) {
          return chat.send(`Error:\n${err.message}`);
        }

      default:
        return chat.send("Unknown command. Use `cli curl <URL>` or `cli eval <code>`.");
    }
  }
};

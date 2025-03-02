const axios = require("axios");

module.exports = {
  manifest: {
    name: "cli",
    aliases: ["test"],
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
        let data = response.data;

        if (typeof data !== "string") {
          data = JSON.stringify(data, null, 2);
        }

        return chat.send(`Response:\n${data}`);
      } catch (error) {
        return chat.send(`Error fetching API:\n${error.message}`);
      }
    }

    try {
      let result = eval(input);

      if (typeof result === "undefined") {
        result = "undefined";
      } else if (typeof result !== "string") {
        result = JSON.stringify(result, null, 2);
      }

      return chat.send(`Result:\n${result}`);
    } catch (err) {
      return chat.send(`Error:\n${err.message}`);
    }
  }
};

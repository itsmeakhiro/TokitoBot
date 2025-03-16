const axios = require("axios").default;

const formatSearchResults = (results, fonts) => {
  if (!results || results.length === 0) return "";

  return results.map((result) => ({
    title: fonts.bold(result.title),
    link: result.link,
    snippet: fonts.sans(result.snippet),
  }));
};

/**
 * @type {Tokito.Command}
 */
const command = {
  manifest: {
    name: "ai",
    aliases: ["chatgpt", "gpt"],
    author: "Aljur Pogoy",
    description: "Chat with AI.",
    usage: "ai <message>",
    cooldown: 5,
    config: { botAdmin: false, botModerator: false },
  },

  async deploy({ chat, args, fonts, event }) {
    const query = args.join(" ").trim();
    if (!query) {
      return chat.send(
        fonts.sans("Provide a question, like this: ai what is Nigeria?")
      );
    }

    try {
      const response = await axios.get(
        "https://kaiz-apis.gleeze.com/api/gpt-4o",
        {
          params: { ask: query, uid: event.senderID, webSearch: "on" },
        }
      );

      if (response.data?.response) {
        let message = fonts.sans(response.data.response);

        if (response.data.results) {
          const formattedResults = formatSearchResults(
            response.data.results,
            fonts
          );
          if (formattedResults.length > 0) {
            message += `\n\n$~~~$ ${JSON.stringify(formattedResults)}`;
          }
        }

        chat.send(message);
      } else {
        chat.send(
          fonts.sans(
            "The API may be experiencing errors or traffic issues. Try again later."
          )
        );
      }
    } catch (error) {
      console.error("AI API Error:", error);
      chat.send(
        fonts.sans(
          "An error occurred while processing your request. Please try again later."
        )
      );
    }
  },
};

module.exports = command;

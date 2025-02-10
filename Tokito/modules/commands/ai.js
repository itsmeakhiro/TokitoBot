const axios = require("axios");

module.exports = {
   manifest: {
      name: "ai",
      aliases: ["chatgpt", "gpt"],
      author: "Francis Loyd Raval", // nahhh ok nato
      description: "Chat with AI.",
      usage: "ai <message>",
      cooldown: 5,
      config: {
         botAdmin: false,
         botModerator: false,
      },
   },
   async deploy({ chat, args, fonts }) {
      const query = args.join(" ");
      if (!query) return chat.send(fonts.sans("Provide a question, like this ai what is niggerian));

      try {
         const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o`, {
            params: { ask: query, uid: 1, webSearch: "off" }
         });

         if (response.data?.response) {
            chat.send(fonts.sans(`Gpt4 Response: ${response.data.response}`));
         } else {
            chat.send(fonts.sans("try again maybe the API is error or traffic error code "));
         }
      } catch (error) {
         console.error("AI API Error:", error);
         chat.send(fonts.sans("Error API LOL"));
      }
   }
};
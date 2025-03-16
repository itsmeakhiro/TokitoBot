const axios = require("axios").default;

/**
 * @type {TokitoLia.Route}
 */
const routes = {
  async chatbotMarin(message) {
    try {
      const data = JSON.stringify({
        context: [{ message, turn: "user", media_id: null }],
        strapi_bot_id: "268789",
        output_audio: false,
        enable_proactive_photos: true,
      });

      const config = {
        method: "POST",
        url: "https://api.exh.ai/chatbot/v4/botify/response",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Content-Type": "application/json",
          "x-auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          authorization: "Bearer eyJhbGciOiJIUzUxMiJ9...",
          "sec-ch-ua-platform": '"Linux"',
          "sec-ch-ua":
            '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132")',
          "sec-ch-ua-mobile": "?0",
          origin: "https://botify.ai",
          "sec-fetch-site": "cross-site",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty",
          referer: "https://botify.ai/",
          "accept-language": "en-US,en;q=0.9",
          priority: "u=1, i",
        },
        data,
      };

      const response = await axios.request(config);

      return (
        response.data.responses?.[0]?.response || "No response from chatbot"
      );
    } catch (error) {
      console.error(
        "Error in chatbot request:",
        error instanceof Error ? error.message : JSON.stringify(error)
      );
      return "Failed to get chatbot response";
    }
  },
};
module.exports = routes;
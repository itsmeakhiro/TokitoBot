const axios = require("axios");

module.exports = {
  async getBuffer(url) {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Error fetching buffer:", error);
      return null;
    }
  },

  async chatbotMarin(message) {
    try {
      let data = JSON.stringify({
        "context": [{ "message": message, "turn": "user", "media_id": null }],
        "strapi_bot_id": "268789",
        "output_audio": false,
        "enable_proactive_photos": true
      });

      let config = {
        method: 'POST',
        url: 'https://api.exh.ai/chatbot/v4/botify/response',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Content-Type': 'application/json',
          'x-auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMGRkYzY3NS01NmU3LTQ3ZGItYmJkOS01YWVjM2Q3OWI2YjMiLCJmaXJlYmFzZV91c2VyX2lkIjoiSGU5azFzMnE3clZJZlJhUU9BU042NzFneFFVMiIsImRldmljZV9pZCI6bnVsbCwidXNlciI6IkhlOWsxczJxN3JWSWZSYVFPQVNONjcxZ3hRVTIiLCJhY2Nlc3NfbGV2ZWwiOiJiYXNpYyIsInBsYXRmb3JtIjoid2ViIiwiZXhwIjoxNzQwMDY1MjAyfQ.AcqDuOKuYkl_Lv1oNWX9MOSFWxSGqvjKdaCKYges4Ic',
          'authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6ImJvdGlmeS13ZWItdjMifQ.O-w89I5aX2OE_i4k6jdHZJEDWECSUfOb1lr9UdVH4oTPMkFGUNm9BNzoQjcXOu8NEiIXq64-481hnenHdUrXfg',
          'sec-ch-ua-platform': '"Linux"',
          'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
          'sec-ch-ua-mobile': '?0',
          'origin': 'https://botify.ai',
          'sec-fetch-site': 'cross-site',
          'sec-fetch-mode': 'cors',
          'sec-fetch-dest': 'empty',
          'referer': 'https://botify.ai/',
          'accept-language': 'en-US,en;q=0.9',
          'priority': 'u=1, i'
        },
        data: data
      };

      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error("Error in chatbot request:", error);
      return { success: false, message: "Failed to get chatbot response" };
    }
  }
};
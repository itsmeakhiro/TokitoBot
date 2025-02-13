const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  async getYouTubeVideo(url) {
    try {
      if (!url) {
        return { success: false, message: "Provide a URL first." };
      }

      const response = await axios.post(
        "https://www.mediamister.com/get_youtube_video",
        new URLSearchParams({ url }).toString(),
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded",
            "sec-ch-ua-platform": '"Android"',
            "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
            "sec-ch-ua-mobile": "?1",
            "x-requested-with": "XMLHttpRequest",
            "dnt": "1",
            "origin": "https://www.mediamister.com",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            "referer": "https://www.mediamister.com/free-youtube-video-downloader",
            "accept-language": "en-US,en;q=0.9,vi;q=0.8,pt;q=0.7,fr;q=0.6",
            "priority": "u=1, i",
          },
        }
      );

      const $ = cheerio.load(response.data);
      const thumbnail = $(".yt_thumb img").attr("src") || null;
      const title = $("h2").first().text().trim() || null;

      let downloadLinks = [];
      $(".yt_format a.download-button").each((index, element) => {
        downloadLinks.push({
          quality: $(element).text().trim(),
          url: $(element).attr("href"),
        });
      });

      return { success: true, title, thumbnail, downloadLinks };
    } catch (error) {
      console.error("Error fetching YouTube video:", error);
      return { success: false, message: "Failed to fetch video details" };
    }
  },

  async getBuffer(url) {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Error fetching buffer:", error);
      return null;
    }
  }
};
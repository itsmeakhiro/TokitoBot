const ytSearch = require("yt-search");
const axios = require("axios");

module.exports = {
    manifest: {
        name: "video",
        aliases: ["ytdl", "ytvideo", "ytsearch"],
        author: "Francis Loyd Raval",
        description: "Searches for YouTube videos and fetches a download link automatically.",
        usage: "video <search query>",
        cooldown: 5,
        config: {
            botAdmin: false,
            botModerator: false,
        },
    },

    async deploy({ chat, args, route, fonts }) {
        if (!args.length) {
            return chat.send(fonts.sans("Please provide a search query."));
        }

        const query = args.join(" ");
        const results = await ytSearch(query);
        if (!results.videos.length) {
            return chat.send(fonts.sans("No results found."));
        }

        const validVideos = results.videos.filter(video => video.seconds > 0 && video.seconds <= 600);
        if (!validVideos.length) {
            return chat.send(fonts.sans("No videos found under 10 minutes."));
        }

        const video = validVideos[0];
        const data = await route.getYouTubeVideo(video.url);

        if (!data.success || !data.downloadLinks.length) {
            return chat.send(fonts.bold("Error:\n") + fonts.bold("Failed to fetch the video."));
        }

        const downloadUrl = data.downloadLinks[0].url;

        try {
            const response = await axios.get(downloadUrl, { responseType: "stream" });

            await chat.send({
                body: fonts.bold(`🎥 ${data.title}\n\n`) + `Duration: ${video.timestamp}`,
                attachment: response.data,
            });
        } catch (error) {
            console.error("Error streaming video:", error);
            chat.send(fonts.bold("Error:\n") + fonts.bold("Failed to stream the video."));
        }
    },
};
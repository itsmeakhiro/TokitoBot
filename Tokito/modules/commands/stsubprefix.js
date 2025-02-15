const fs = require("fs-extra");
const path = require("path");

const subprefixFile = path.join(__dirname, "../../../System/handler/data/subprefixes.json");

function saveSubprefix(threadID, subprefix) {
    try {
        const subprefixes = fs.existsSync(subprefixFile)
            ? JSON.parse(fs.readFileSync(subprefixFile, "utf-8"))
            : {};

        subprefixes[threadID] = subprefix;
        fs.writeFileSync(subprefixFile, JSON.stringify(subprefixes, null, 2));
    } catch (error) {
        console.error("Error saving subprefix:", error);
    }
}

module.exports = {
    manifest: {
        name: "setsubprefix",
        aliases: ["setsuffix"],
        author: "Francis Loyd Raval",
        description: "Sets a custom subprefix for this group.",
        usage: "setsubprefix <new_subprefix>",
        cooldown: 5,
        config: {
            botAdmin: false,
            botModerator: false,
        },
    },
    async deploy({ api, chat, args, event, fonts }) {
        if (!args.length) {
            return chat.send(fonts.sans("Please provide a new subprefix."));
        }

        const subprefix = args[0];

        if (subprefix.length > 10) {
            return chat.send(fonts.sans("Subprefix should be 10 characters or less."));
        }

        const threadInfo = await api.getThreadInfo(event.threadID);
        const admins = threadInfo.adminIDs.map(admin => admin.id);

        if (!admins.includes(event.senderID)) {
            return chat.send(fonts.sans("Only group admins can change the subprefix."));
        }

        saveSubprefix(event.threadID, subprefix);
        chat.send(fonts.sans(`Subprefix for this group has been set to: ${subprefix}`));
    },
};
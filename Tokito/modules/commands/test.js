module.exports = {
  manifest: {
    name: "hi",
    aliases: ["h"],
    author: "Francis Loyd Raval",
    description: "Dunno testing lng.",
    usage: "hi",
    cooldown: 5,
    config: {
      botAdmin: false,
      botModerator: false,
    },
  },
  async deploy({ chat, fonts }) {
    chat.send(fonts.sans("ha?"));
  },
};

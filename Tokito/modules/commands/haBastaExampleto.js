const commands = [
  {
    subcommand: "info",
    description: "Displays information about the bot.",
    deploy: async ({ chat }) => {
      await chat.send("This is a Tokito bot designed to automate tasks.");
    },
  },
  {
    subcommand: "help",
    description: "Shows available commands.",
    deploy: async ({ chat }) => {
      await chat.send("Use the available subcommands to get specific help.");
    },
  },
];

module.exports = {
  manifest: {
    name: "example",
    description: "Example command using tokitoHM",
    usage: ["example info", "example help"],
  },
  config: {
    noPrefix: false,
  },
  async deploy(ctx) {
    const home = new ctx.tokitoHM(commands, "◆");
    await home.runInContext(ctx);
  },
};

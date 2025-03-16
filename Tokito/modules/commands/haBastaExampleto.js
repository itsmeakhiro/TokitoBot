// DO NOT MODIFY, THIS WILL NOW SERVE AS EXAMPLE
/**
 * @type {TokitoLia.Command}
 */
const command = {
  manifest: {
    name: "example",
    aliases: ["e"],
    description: "Example command using tokitoHM",
    usage: ["example info", "example help"],
    config: {
      botAdmin: false,
      botModerator: false,
    },
  },
  async deploy(ctx) {
    const home = new ctx.TokitoHM(
      [
        {
          subcommand: "info",
          description: "Displays information about the bot.",
          async deploy({ chat }) {
            await chat.send("This is a Tokito bot designed to automate tasks.");
          },
        },
        {
          subcommand: "help",
          description: "Shows available commands.",
          async deploy({ chat }) {
            await chat.send(
              "Use the available subcommands to get specific help."
            );
          },
        },
      ],
      "◆"
    );
    await home.runInContext(ctx);
  },
};
module.exports = command;

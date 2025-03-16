// profile.js
/**
 * @type {TokitoLia.Command}
 */
const command = {
  manifest: {
    name: "profile",
    aliases: ["prof", "me"],
    author: "Liane Cagara",
    description: "View your profile and balance information",
    usage: ["!profile <subcommand>", "e.g., !profile view or !profile balance"],
    cooldown: 3,
    config: {
      botAdmin: false,
      botModerator: false,
      noPrefix: false,
      privateOnly: false,
    },
  },
  async deploy(ctx) {
    const subcommands = [
      {
        subcommand: "view",
        description: "View your full profile",
        deploy: async function (/** @type {TokitoLia.CommandContext} */ ctx) {
          const { chat, event, fonts, tokitoDB, LevelSystem, BalanceHandler } =
            ctx;
          const userData = await tokitoDB.get(event.senderID);
          const levelSystem = new LevelSystem(userData);
          const balanceHandler = new BalanceHandler(userData);

          const profileText = [
            `${fonts.bold("Username")}: ${levelSystem.getUsername()}`,
            `${fonts.bold("Level")}: ${levelSystem.getLevel()}`,
            `${fonts.bold("Rank")}: ${levelSystem.getRank()}`,
            `${fonts.bold("XP")}: ${levelSystem.getXP().toLocaleString()}`,
            `${fonts.bold("Balance")}: ${balanceHandler
              .getBalance()
              .toLocaleString()} credits`,
            `${fonts.bold("Wealth Rank")}: ${balanceHandler.getWealthRank()}`,
          ].join("\n");

          const message = `User Profile\n\n${profileText}\n\nLast updated: ${new Date(
            userData.lastModified
          ).toLocaleString()}`;
          return chat.send(message);
        },
      },
      {
        subcommand: "balance",
        description: "View your balance and wealth rank",
        deploy: async function (/** @type {TokitoLia.CommandContext} */ ctx) {
          const { chat, event, fonts, tokitoDB, BalanceHandler } = ctx;
          const userData = await tokitoDB.get(event.senderID);
          const balanceHandler = new BalanceHandler(userData);

          const balanceText = [
            `${fonts.bold("Balance")}: ${balanceHandler
              .getBalance()
              .toLocaleString()} credits`,
            `${fonts.bold("Wealth Rank")}: ${balanceHandler.getWealthRank()}`,
          ].join("\n");

          const message = `Balance Overview\n\n${balanceText}\n\nLast updated: ${new Date(
            userData.lastModified
          ).toLocaleString()}`;
          return chat.send(message);
        },
      },
    ];

    const profileHandler = new ctx.TokitoHM(subcommands, "👤");

    return profileHandler.runInContext(ctx);
  },
};

module.exports = command;

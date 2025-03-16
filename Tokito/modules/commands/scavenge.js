/**
 * @type {TokitoLia.Command}
 */
const command = {
  manifest: {
    name: "scavenge",
    aliases: ["scav", "hunt"],
    author: "Liane Cagara",
    description: "Scavenge for a random valuable item (30-minute cooldown)",
    usage: ["!scavenge"],
    cooldown: 0,
    config: {
      botAdmin: false,
      botModerator: false,
      noPrefix: false,
      privateOnly: false,
    },
  },
  async deploy(ctx) {
    const { chat, event, fonts, tokitoDB, Inventory } = ctx;
    const COOLDOWN_MINUTES = 30;
    const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

    const scavengeItems = [
      {
        name: "Golden Blade",
        key: "golden-blade",
        flavorText: "A gleaming sword found in the ruins.",
        icon: "⚔",
        type: "weapon",
        atk: 50,
        sellPrice: 100,
      },
      {
        name: "Elixir of Life",
        key: "elixir-life",
        flavorText: "A rare potion unearthed from the depths.",
        icon: "🧪",
        type: "food",
        heal: 100,
        sellPrice: 100,
      },
      {
        name: "Diamond Armor",
        key: "diamond-armor",
        flavorText: "Ancient armor still shining.",
        icon: "🛡",
        type: "armor",
        def: 40,
        sellPrice: 100,
      },
      {
        name: "Mystic Gem",
        key: "mystic-gem",
        flavorText: "A hidden treasure with arcane energy.",
        icon: "💎",
        type: "generic",
        sellPrice: 150,
      },
    ];

    const userData = await tokitoDB.get(event.senderID);
    const lastRewardStamp = Number(userData.rewardStamp) || 0;
    const now = Date.now();

    const timeSinceLast = now - lastRewardStamp;
    if (timeSinceLast < COOLDOWN_MS) {
      const remainingMs = COOLDOWN_MS - timeSinceLast;
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      return chat.send(
        `You must wait ${remainingMinutes} minute(s) before scavenging again!`
      );
    }

    const inventory = new Inventory(userData.inventory || [], 100);
    if (inventory.size() >= inventory.limit) {
      return chat.send("Your inventory is full! Clear space to scavenge.");
    }

    const randomItem =
      scavengeItems[Math.floor(Math.random() * scavengeItems.length)];
    inventory.addOne(randomItem);

    await tokitoDB.set(event.senderID, {
      inventory: inventory.raw(),
      rewardStamp: now,
    });

    const message = `Scavenging Success!\n\nFound: ${
      randomItem.icon
    } ${fonts.bold(randomItem.name)} (${randomItem.key})\n${
      randomItem.flavorText
    }\nValue: ${randomItem.sellPrice.toLocaleString()} credits`;
    return chat.send(message);
  },
};

module.exports = command;

class TokitoHM {
  constructor(commands, icon = "✦") {
    if (!Array.isArray(commands)) {
      throw new Error("Commands must be an array.");
    }
    this.commands = new Map(commands.map((cmd) => [cmd.subcommand, cmd]));
    this.icon = icon;
  }

  async runInContext(ctx) {
    const { args, chat } = ctx;
    const subcommand = args[0];

    if (!subcommand || !this.commands.has(subcommand)) {
      const list = [...this.commands.values()]
        .map((cmd) => `${this.icon} ${cmd.subcommand} → ${cmd.description}`)
        .join("\n");
      return chat.send(`Available subcommands:\n\n${list}`);
    }

    return this.commands.get(subcommand).deploy(ctx);
  }
}

module.exports = TokitoHM;

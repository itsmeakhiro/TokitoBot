const WEALTH_RANKS = [
  { amount: 0, rank: "Broke" },
  { amount: 500, rank: "Beginner Saver" },
  { amount: 1000, rank: "Average Earner" },
  { amount: 5000, rank: "Wealthy Citizen" },
  { amount: 10000, rank: "Elite Investor" },
  { amount: 50000, rank: "Millionaire" },
  { amount: 100000, rank: "Billionaire" }
];

class BalanceHandler {
  constructor(data) {
    this.data = data ?? {};
    this.data.balance = typeof this.data.balance === "number" ? this.data.balance : null;
  }

  isRegistered() {
    return typeof this.data.balance === "number";
  }

  getBalance() {
    if (!this.isRegistered()) throw new Error("User not registered.");
    return this.data.balance;
  }

  addBalance(amount) {
    if (!this.isRegistered()) throw new Error("User not registered.");
    if (typeof amount !== "number" || amount <= 0) throw new Error("Invalid amount.");
    this.data.balance += amount;
  }

  deductBalance(amount) {
    if (!this.isRegistered()) throw new Error("User not registered.");
    if (typeof amount !== "number" || amount <= 0) throw new Error("Invalid amount.");
    if (this.data.balance < amount) throw new Error("Insufficient balance.");
    this.data.balance -= amount;
  }

  getWealthRank() {
    if (!this.isRegistered()) throw new Error("User not registered.");
    let rank = WEALTH_RANKS.findLast((r) => this.data.balance >= r.amount);
    return rank ? rank.rank : WEALTH_RANKS[0].rank;
  }

  export() {
    return { balance: this.data.balance };
  }
      }

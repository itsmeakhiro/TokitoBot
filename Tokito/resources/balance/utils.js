const WEALTH_RANKS = [
  { amount: 0, rank: "Low Income" },
  { amount: 1000, rank: "Middle Class" },
  { amount: 10000, rank: "Upper Middle Class" },
  { amount: 100000, rank: "Affluent" },
  { amount: 500000, rank: "Wealthy" },
  { amount: 1000000, rank: "Millionaire" },
  { amount: 5000000, rank: "Multi-Millionaire" },
  { amount: 50000000, rank: "Billionaire" },
  { amount: 1000000000, rank: "Multi-Billionaire" }
];

class BalanceHandler {
  constructor(data) {
    this.data = data ?? {};
    this.data.balance = typeof this.data.balance === "number" ? this.data.balance : 0;
  }

  getBalance() {
    return this.data.balance;
  }

  addBalance(amount) {
    if (typeof amount !== "number" || amount <= 0) throw new Error("Invalid amount.");
    this.data.balance += amount;
  }

  deductBalance(amount) {
    if (typeof amount !== "number" || amount <= 0) throw new Error("Invalid amount.");
    if (this.data.balance < amount) throw new Error("Insufficient balance.");
    this.data.balance -= amount;
  }

  getWealthRank() {
    let rank = WEALTH_RANKS.findLast((r) => this.data.balance >= r.amount);
    return rank ? rank.rank : WEALTH_RANKS[0].rank;
  }

  export() {
    return { balance: this.data.balance };
  }
}

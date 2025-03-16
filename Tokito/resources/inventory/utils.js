class Inventory {
  constructor(inventory = [], limit = Infinity) {
    inventory ??= [];

    this.limit = limit;

    this.inv = this.sanitize(JSON.parse(JSON.stringify(inventory)));
  }
  sanitize(inv = this.inv) {
    if (!Array.isArray(inv)) {
      throw new Error("Inventory must be an array.");
    }
    let result = inv.slice(0, this.limit).map((item, index) => {
      const {
        name = "Unknown Item",
        key = "",
        flavorText = "Mysteriously not known to anyone.",
        icon = "❓",
        type = "generic",
        cannotToss = false,
        sellPrice = 0,
      } = item;
      if (!key) {
        return;
      }
      let result = {
        ...item,
        name: String(name),
        key: String(key).replaceAll(" ", ""),
        flavorText: String(flavorText),
        icon: String(icon),
        type: String(type),
        index: Number(index),
        sellPrice: parseInt(sellPrice),
        cannotToss: !!cannotToss,
      };
      if (type === "food") {
        result.heal ??= 0;
        result.heal = parseInt(result.heal);
      }
      if (type === "weapon" || type === "armor") {
        result.atk ??= 0;
        result.def ??= 0;
        result.atk = parseFloat(result.atk);
        result.def = parseFloat(result.def);
      }
      return result;
    });
    return result.filter(Boolean);
  }

  at(index) {
    const parsedIndex = parseInt(index);
    return isNaN(parsedIndex) ? undefined : this.inv.at(parsedIndex - 1);
  }

  getOne(key) {
    return this.inv.find((item) => item.key === key) || this.at(key);
  }
  get(key) {
    return this.inv.filter(
      (item) => item.key === key || item.key === this.keyAt(key)
    );
  }
  getAll() {
    return this.inv;
  }
  deleteRef(item) {
    let index = this.inv.indexOf(item);

    if (index === -1) {
      index = parseInt(item) - 1;
    }

    if (index !== -1 && !isNaN(index)) {
      this.inv.splice(index, 1);
    }
  }

  deleteRefs(items) {
    for (const item of items) {
      this.deleteRef(item);
    }
  }
  findKey(callback) {
    const result = this.inv.find((item) => callback(item) || this.keyAt(item));
    if (result) {
      return result.key;
    } else {
      return null;
    }
  }
  indexOf(item) {
    return this.inv.indexOf(item);
  }
  size() {
    return this.inv.length;
  }
  clone() {
    return new Inventory(this.inv);
  }
  toJSON() {
    return this.inv;
  }
  deleteOne(key) {
    let index = this.inv.findIndex(
      (item) => item.key === key || item.key === this.keyAt(key)
    );
    if (index === -1) {
      index = parseInt(key) - 1;
    }
    if (index === -1 || isNaN(index)) {
      return false;
    }
    this.inv = this.inv.filter((_, i) => i !== index);
  }
  keyAt(index) {
    return this.at(index)?.key;
  }
  delete(key) {
    this.inv = this.inv.filter(
      (item) => item.key !== key || item.key !== this.keyAt(key)
    );
  }
  has(key) {
    return this.inv.some(
      (item) => item.key === key || item.key === this.keyAt(key)
    );
  }
  hasAmount(key, amount) {
    const length = this.getAmount(key);
    return length >= amount;
  }
  getAmount(key) {
    return this.get(key).length;
  }
  addOne(item) {
    return this.inv.push(item);
  }

  add(item) {
    return this.inv.push(...item);
  }
  toss(key, amount) {
    if (amount === "all") {
      amount = this.getAmount(key);
    }

    for (let i = 0; i < amount; i++) {
      this.deleteOne(key);
    }
  }
  tossDEPRECATED(key, amount) {
    if (amount === "all") {
      const i = this.getAmount(key);
      this.delete(key);
      return i;
    }
    let r = 0;
    for (let i = 0; i < amount; i++) {
      if (!this.has(key)) {
        break;
      }
      this.deleteOne(key);
      r++;
    }
    return r;
  }
  setAmount(key, amount) {
    const data = this.get(key);
    for (let i = 0; i < amount; i++) {
      this.addOne(data[i]);
    }
  }
  *[Symbol.iterator]() {
    yield* this.inv;
  }
  raw() {
    return Array.from(this.inv);
  }
  export() {
    return {
      inventory: this.raw(),
    };
  }
  *keys() {
    yield* this.inv.map((item) => item.key);
  }
}

module.exports = Inventory;

const fs = require("fs-extra");
const path = require("path");

const LEVEL_DATA_PATH = path.join(__dirname, "levelData.json");

const RANKS = {};
for (let i = 1; i <= 200; i++) {
    if (i <= 10) RANKS[i] = "New Recruit";
    else if (i <= 20) RANKS[i] = "Trainee Slayer";
    else if (i <= 30) RANKS[i] = "Kanoe (Upper Water)";
    else if (i <= 40) RANKS[i] = "Kanoto (Upper Water II)";
    else if (i <= 50) RANKS[i] = "Tsuchinoto (Earth’s Base)";
    else if (i <= 60) RANKS[i] = "Tsuchinoe (Earth’s Branch)";
    else if (i <= 70) RANKS[i] = "Hinoto (Flame’s Base)";
    else if (i <= 80) RANKS[i] = "Hinoe (Flame’s Branch)";
    else if (i <= 90) RANKS[i] = "Pillar Candidate";
    else if (i <= 100) RANKS[i] = "Hashira (Pillar)";
    else if (i <= 110) RANKS[i] = "Senior Hashira";
    else if (i <= 120) RANKS[i] = "Elite Slayer";
    else if (i <= 130) RANKS[i] = "Demon Slayer Champion";
    else if (i <= 140) RANKS[i] = "Grandmaster Hashira";
    else if (i <= 150) RANKS[i] = "Moonlit Slayer";
    else if (i <= 160) RANKS[i] = "Eclipse Vanquisher";
    else if (i <= 170) RANKS[i] = "Legendary Slayer";
    else if (i <= 180) RANKS[i] = "Master of Demons";
    else if (i <= 190) RANKS[i] = "Supreme Hashira";
    else RANKS[i] = "LEGENDARY HASHIRA";
}

class LevelSystem {
    constructor(uid, username = "Unknown") {
        this.uid = uid;
        this.username = username;
        this.loadData();
    }

    loadData() {
        if (fs.existsSync(LEVEL_DATA_PATH)) {
            try {
                const data = JSON.parse(fs.readFileSync(LEVEL_DATA_PATH, "utf8"));
                if (data[this.uid]) {
                    this.xp = data[this.uid].xp;
                    this.level = data[this.uid].level;
                    this.rank = data[this.uid].rank;
                    return;
                }
            } catch (err) {
                console.error("Error loading level data:", err);
            }
        }
        this.xp = 0;
        this.level = 1;
        this.rank = RANKS[1];
        this.saveData();
    }

    saveData() {
        let data = {};
        if (fs.existsSync(LEVEL_DATA_PATH)) {
            try {
                data = JSON.parse(fs.readFileSync(LEVEL_DATA_PATH, "utf8"));
            } catch (err) {
                console.error("Error reading level data:", err);
            }
        }
        data[this.uid] = { xp: this.xp, level: this.level, rank: this.rank, username: this.username };
        fs.writeFileSync(LEVEL_DATA_PATH, JSON.stringify(data, null, 2));
    }

    addXP(amount) {
        this.xp += amount;
        const xpNeeded = Math.floor(100 * Math.pow(1.2, this.level));
        let leveledUp = false;

        while (this.xp >= xpNeeded && this.level < 200) {
            this.xp -= xpNeeded;
            this.level += 1;
            leveledUp = true;
        }

        this.rank = RANKS[this.level];
        this.saveData();
        return { leveledUp, newLevel: this.level, newRank: this.rank };
    }

    getLevel() {
        return this.level;
    }

    getRank() {
        return this.rank;
    }

    getXP() {
        return this.xp;
    }
}

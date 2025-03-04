const fs = require("fs-extra");
const path = require("path");

const LEVEL_DATA_PATH = path.join(__dirname, "levelData.json");

const RANKS = {};
for (let i = 1; i <= 200; i++) {
    if (i <= 5) RANKS[i] = "Untrained Recruit";
    else if (i <= 10) RANKS[i] = "Trainee Slayer";
    else if (i <= 15) RANKS[i] = "Demon Slayer Initiate";
    else if (i <= 20) RANKS[i] = "Junior Slayer";
    else if (i <= 30) RANKS[i] = "Kanoe (Lower Water)";
    else if (i <= 40) RANKS[i] = "Kanoto (Upper Water)";
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
    constructor() {
        this.levelData = this.loadData();
        this.registeredUsers = new Set(Object.keys(this.levelData));
    }

    loadData() {
        if (fs.existsSync(LEVEL_DATA_PATH)) {
            try {
                return JSON.parse(fs.readFileSync(LEVEL_DATA_PATH, "utf8"));
            } catch (err) {
                console.error("Error loading level data:", err);
                return {};
            }
        }
        return {};
    }

    saveData() {
        fs.writeFileSync(LEVEL_DATA_PATH, JSON.stringify(this.levelData, null, 2));
    }

    generateGameID(uid) {
        return `id_${Math.floor(Math.random() * 100000)}(${uid.slice(-5)})`;
    }

    registerUser(uid, username = "Unknown") {
        if (this.registeredUsers.has(uid)) return false;

        this.levelData[uid] = {
            xp: 0,
            level: 1,
            username,
            gameID: this.generateGameID(uid),
            rank: RANKS[1]
        };

        this.registeredUsers.add(uid);
        this.saveData();
        return true;
    }

    isRegistered(uid) {
        return this.registeredUsers.has(uid);
    }

    getUser(uid) {
        return this.isRegistered(uid) ? this.levelData[uid] : null;
    }

    getLevel(uid) {
        return this.isRegistered(uid) ? this.levelData[uid].level : null;
    }

    getRank(uid) {
        return this.isRegistered(uid) ? this.levelData[uid].rank : null;
    }

    getEXP(uid) {
        return this.isRegistered(uid) ? this.levelData[uid].xp : null;
    }

    addXP(uid, amount) {
        if (!this.isRegistered(uid)) return { error: "User not registered" };

        const user = this.getUser(uid);
        user.xp += amount;

        let xpNeeded = Math.floor(100 * Math.pow(1.2, user.level));
        let leveledUp = false;

        while (user.xp >= xpNeeded && user.level < 200) {
            user.xp -= xpNeeded;
            user.level += 1;
            xpNeeded = Math.floor(100 * Math.pow(1.2, user.level)); 
            leveledUp = true;
        }

        user.rank = RANKS[user.level];
        this.saveData();
        return { leveledUp, newLevel: user.level, newRank: user.rank };
    }

    resetUser(uid) {
        if (!this.isRegistered(uid)) return false;

        delete this.levelData[uid];
        this.registeredUsers.delete(uid);
        this.saveData();
        return true;
    }

    getLeaderboard() {
        return Object.entries(this.levelData)
            .sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp)
            .slice(0, 5)
            .map(([uid, data]) => ({
                uid,
                username: data.username,
                gameID: data.gameID,
                level: data.level,
                rank: data.rank,
                xp: data.xp
            }));
    }
}

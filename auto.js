// A one of the beta function of Tokito, Do not modify this code!!

const log = require("./System/logger");
const login = require("./System/login");
const fs = require("fs-extra");
const path = require("path");
const express = require("express");

const { config } = global.Tokito;

const router = express.Router();
const appStateDir = path.join(__dirname, "System", "handler", "data");

fs.ensureDirSync(appStateDir);

async function saveAppState(appState) {
    try {
        const uid = appState.find(item => item.key === "c_user")?.value;
        if (!uid) {
            log("ERROR", "Invalid appState: No UID found.");
            return { success: false, message: "Invalid appState, no UID found." };
        }

        const filePath = path.join(appStateDir, `${uid}.json`);
        await fs.writeJSON(filePath, appState, { spaces: 2 });

        log("SYSTEM", `New appState saved for UID: ${uid}`);
        return { success: true, message: `AppState saved for UID: ${uid}` };
    } catch (error) {
        log("ERROR", `Failed to save appState: ${error.message}`);
        return { success: false, message: "Failed to save appState." };
    }
}

router.get("/login", async (req, res) => {
    try {
        const state = req.query.state;
        if (!state) {
            return res.status(400).json({ success: false, message: "No appState provided." });
        }

        let appState;
        try {
            appState = JSON.parse(decodeURIComponent(state));
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid appState format." });
        }

        if (!Array.isArray(appState)) {
            return res.status(400).json({ success: false, message: "appState must be an array." });
        }

        const result = await saveAppState(appState);
        res.json(result);
    } catch (error) {
        log("ERROR", `Error in /login endpoint: ${error.message}`);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

async function autoLogin() {
    try {
        const files = await fs.readdir(appStateDir);
        if (files.length === 0) {
            log("SYSTEM", "No saved appStates found.");
            return;
        }

        for (const file of files) {
            const filePath = path.join(appStateDir, file);
            const appState = await fs.readJSON(filePath);
            log("SYSTEM", `Attempting login with ${file}...`);

            login({ appState }, {
                listenEvents: config.fcaOptions.listenEvents,
        selfListen: config.fcaOptions.selfListen,
        bypassRegion: config.fcaOptions.bypassRegion,
            }, async (err, api) => {
                if (err) {
                    log("ERROR", `Login failed for ${file}: ${err.message}`);

                    await fs.remove(filePath);
                    log("SYSTEM", `Invalid appState removed: ${file}`);

                    return;
                }

                log("SYSTEM", `Logged in successfully with UID: ${file.replace(".json", "")}`);
            });
        }
    } catch (error) {
        log("ERROR", `Auto-login failed: ${error.message}`);
    }
}

autoLogin();

module.exports = router;

const { execSync } = require("child_process");
const login = require("ws3-fca");
const log = require("./logger");
const fs = require("fs-extra");
const path = require("path");

const { config } = global.Tokito;
const appStateDir = path.join(__dirname, "..", "System", "handler", "data");

async function installWs3Fca() {
    try {
        log("SYSTEM", "Installing latest ws3-fca...");
        execSync("npm i ws3-fca@latest", { stdio: "inherit" });
        log("SYSTEM", "ws3-fca installed successfully.");
    } catch (error) {
        log("ERROR", `Failed to install ws3-fca: ${error.message}`);
    }
}

async function getAppState() {
    try {
        fs.ensureDirSync(appStateDir);

        const files = await fs.readdir(appStateDir);
        if (files.length > 0) {
            const filePath = path.join(appStateDir, files[0]);
            log("SYSTEM", `Using appState from ${filePath}`);
            return fs.readJSON(filePath);
        }

        log("SYSTEM", "No appState found in handler/data, falling back to cookies.json.");
        const cookiePath = path.join(__dirname, "..", "cookies.json");

        if (fs.existsSync(cookiePath)) {
            return fs.readJSON(cookiePath);
        }

        log("ERROR", "No valid appState found.");
        return null;
    } catch (error) {
        log("ERROR", `Failed to load appState: ${error.message}`);
        return null;
    }
}

async function saveAppState(api) {
    try {
        const appState = api.getAppState();
        const uid = appState.find(item => item.key === "c_user")?.value;
        if (!uid) {
            log("ERROR", "Failed to save appState: No UID found.");
            return;
        }

        const filePath = path.join(appStateDir, `${uid}.json`);
        await fs.writeJSON(filePath, appState, { spaces: 2 });
        log("SYSTEM", `AppState saved for UID: ${uid}`);
    } catch (error) {
        log("ERROR", `Failed to save appState: ${error.message}`);
    }
}

module.exports = async function logger() {
    await installWs3Fca();

    const appState = await getAppState();
    if (!appState || !Array.isArray(appState)) {
        log("ERROR", "No valid appState available for login.");
        return;
    }

    login({ appState }, {
        listenEvents: config.fcaOptions.listenEvents,
        selfListen: config.fcaOptions.selfListen,
        bypassRegion: config.fcaOptions.bypassRegion,
    }, async (err, api) => {
        if (err) {
            log("ERROR", `Login Failed: ${err.message}`);
            return;
        }

        log("SYSTEM", "Logged In Successfully...");
        await saveAppState(api); // Save new appState after login

        try {
            const listener = require("./listener");

            api.listenMqtt(async (error, event) => {
                if (error) {
                    log("ERROR", error === "Connection Closed" ? "Connection Failed To Connect" : error);
                    return;
                }
                await listener({ api, event });
            });

        } catch (error) {
            log("ERROR", `Failed to start listener: ${error.stack}`);
        }
    });
};

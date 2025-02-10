const login = require("chatbox-fca-remake");
const fs = require("fs-extra");
const path = require("path");

const { config } = global.Tokito;

function log(type, message) {
    const colors = {
        TOP: "\x1b[32m",
        SYSTEM: "\x1b[34m",
        COMMAND: "\x1b[32m",
        ERROR: "\x1b[31m",
        RESET: "\x1b[0m",
    };
    console.log(`${colors[type] || colors.SYSTEM}[ ${type} ]${colors.RESET} ${message}`);
}

module.exports = async function logger() {
    let cookie;
    try {
        cookie = fs.readJSONSync(path.join(__dirname, "..", "cookies.json"));
        
        if (!Array.isArray(cookie)) {
            log("ERROR", "cookies.json does not contain a valid array of cookies.");
            return;
        }
    } catch (err) {
        log("ERROR", "Failed to read cookies.json");
        return;
    }

    login({ appState: cookie }, async (err, api) => {
        if (err) {
            log("ERROR", `Login Failed: ${err.message}`);
            return;
        }

        log("SYSTEM", "Logged In Successfully...");

        if (!config?.fcaOptions) {
            log("ERROR", "Missing fcaOptions in config. Using default values.");
        }

        api.setOptions({
            listenEvents: config.fcaOptions.listenEvents,
            selfListen: config.fcaOptions.selfListen,
        });

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
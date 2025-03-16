const { execSync } = require("child_process");
const login = require("ws3-fca");
const log = require("./logger");
const fs = require("fs-extra");
const path = require("path");

const { config } = global.Tokito;

async function installWs3Fca() {
  try {
    log("SYSTEM", "Installing latest ws3-fca...");
    execSync("npm i ws3-fca@latest", { stdio: "inherit" });
    log("SYSTEM", "ws3-fca installed successfully.");
  } catch (error) {
    log(
      "ERROR",
      `Failed to install ws3-fca: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`
    );
  }
}

module.exports = async function logger() {
  await installWs3Fca();

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

  login(
    { appState: cookie },
    {
      listenEvents: config.fcaOptions.listenEvents,
      selfListen: config.fcaOptions.selfListen,
      bypassRegion: config.fcaOptions.bypassRegion,
    },
    async (err, api) => {
      if (err) {
        log("ERROR", `Login Failed: ${err.message}`);
        return;
      }

      log("SYSTEM", "Logged In Successfully...");
      try {
        const listener = require("./listener");

        api.listenMqtt(async (error, event) => {
          if (error) {
            log(
              "ERROR",
              error === "Connection Closed"
                ? "Connection Failed To Connect"
                : error
            );
            return;
          }
          await listener({ api, event });
        });
      } catch (error) {
        log(
          "ERROR",
          `Failed to start listener: ${
            error instanceof Error ? error.stack : JSON.stringify(error)
          }`
        );
      }
    }
  );
};

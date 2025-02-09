const login = require("chatbox-fca-remake");
const fs = require("fs-extra");
const path = require("path");

const { config } = global.Tokito;

function log(type, message){
  const colors = {
          TOP: "\x1b[32m",
          SYSTEM: "\x1b[34m",
          COMMAND: "\x1b[32m",
          ERROR: "\x1b[31m",
          RESET: "\x1b[0m",
      };
    console.log(`${colors[type] || colors.SYSTEM}[ ${type} ]${colors.RESET} ${message}`);
  }

module.exports = async function logger(){
   const cookie = fs.readJSONSync(path.join(__dirname, "..", "cookies.json"));
   const original = console.log;
   console.log = () => {};
   login({ appState: cookie }, (err, api) => {
    console.log = original;

    if (err){
      log("ERROR", `Login Failed: ${err.message}`);
      return;
    } else {
      log("SYSTEM", "Logged In Successfully...")
    }
    
    api.setOptions({
      listenEvents: config.fcaOptions.listenEvents,
      selfListen: config.fcaOptions.selfListen

    })

    try {
      var listenerEmitter = api.listenMqtt(async (error, event) => {
        if (error){
          log("ERROR", error === "Connection Closed" ? "Connection Failed To Connect" : error);
          return;
        }

        const listener = require("./listener");
        await listener({ api, event })
      });
    } catch (error) {
     log("ERROR", `Failed to start: ${error.stack}`)
    };
  })  
}
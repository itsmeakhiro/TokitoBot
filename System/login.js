const login = require("chatbox-fca-remake");
const fs = require("fs-extra");
const path = require("path");

const { config } = global.Tokito;

module.exports = async function logger(){
   const cookie = fs.readJSONSync(path.join(__dirname, "cookies.json"));
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
      selfListen: config.fcaOptions.selfListen,
      userAgent: config.fcaOptions.userAgent
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
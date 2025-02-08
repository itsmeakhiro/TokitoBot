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
      listenEvents: config.fcaOptions.listenEvents;
      selfListen: config.fcaOptions.selfListen;
    })

    try 
  })  
}
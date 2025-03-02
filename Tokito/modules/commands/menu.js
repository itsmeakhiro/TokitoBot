const path = require("path");
const fs = require("fs-extra");

module.exports = {
  manifest: {
    name: "help",
    config: {
      botAdmin: false,
      botModerator: false,
    }
  },
  style: {
    type: "Hdesign",
    title: "Help",
    footer: "Test",
  },
  font: {
    title: ["bold", "outline"],
    content: "sans",
    footer: "sans",
  },
  async deploy({ chat }) {  
    const commandsDir = __dirname;  
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js"));  
    const commandList = commandFiles.map(file => `│ ${file}`).join("\n");  
    await chat.send(commandList);  
  }
};

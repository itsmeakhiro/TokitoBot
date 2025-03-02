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

    const commandNames = commandFiles.map(file => {  
      try {  
        const command = require(path.join(commandsDir, file));  
        return command.manifest?.name ? `│${command.manifest.name}` : null;  
      } catch (err) {  
        return null;  
      }  
    }).filter(Boolean);  

    const commandList = commandNames.join("\n");  
    await chat.send(commandList);  
  }
};

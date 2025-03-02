const path = require("path");  
const fs = require("fs-extra");  

const commandsDir = __dirname;  
const totalCommands = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js")).length;  

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
    title: "📚 TOKITO Commands",  
    footer: `🛠️ Total Commands: ${totalCommands}\n\nℹ️ This is a beta test botfile developed by Francis Loyd Raval. More updates will come up soon. Stay tuned!!!`,  
  },  
  font: {  
    title: ["bold", "Sans"],  
    content: "sans",  
    footer: "sans",  
  },  
  async deploy({ chat }) {    
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

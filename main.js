const fs = require("fs-extra");
const path = require("path");
const express = require("express");
const app = express();

process.on("unhandledRejection", (...args) => log("ERROR", ...args));
process.on("uncaughtException", (...args) => log("ERROR", ...args));

process.on("unhandledRejection", (error) => log("ERROR", error));
process.on("uncaughtException", (error) => log("ERROR", error));

global.Tokito = {
    get config(){
        return JSON.parse(fs.readFileSync(path.join(__dirname, "botdata.json"), "utf-8"));
    },
    set config(config){
        const data = global.Tokito.config;
        const finalData = { ...data, ...config };
            const str = JSON.stringify(finalData, null, 2);
                fs.writeFileSync(path.join(__dirname, "botdata.json"), str);
    }
}

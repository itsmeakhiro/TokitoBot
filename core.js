const fs = require("fs-extra");
const path = require("path");
const log = require("./System/logger");
const tokito = require("./tokito");
const express = require("express");
const app = express();

process.on("unhandledRejection", (error) => log("ERROR", error.stack));
process.on("uncaughtException", (error) => log("ERROR", error.stack));

app.use("", tokito);

global.Tokito = {
    get config(){
        try {
            return JSON.parse(fs.readFileSync(path.join(__dirname, "botdata.json"), "utf-8"));
        } catch (error) {
            log("ERROR", "Failed to read botdata.json: " + error.message);
            return {};
        }
    },
    set config(config){
        const data = global.Tokito.config;
        const finalData = { ...data, ...config };
        const str = JSON.stringify(finalData, null, 2);
        fs.writeFileSync(path.join(__dirname, "botdata.json"), str);
    },
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map()
},

Object.assign(global.Tokito, {
    get prefix() { return global.Tokito.config.prefix; },
    get maintenance() { return global.Tokito.config.maintenance; },
    get antitheft() { return global.Tokito.config.antitheft; },
    get developers() { return global.Tokito.config.developers; },
    get admins() { return global.Tokito.config.admins; },
    get moderator() { return global.Tokito.config.moderator; },
    get webDevs() { return global.Tokito.config.webDevs; },
    get webAdmns() { return global.Tokito.config.webAdmns; },
    get webMods() { return global.Tokito.config.webMods; },
});

async function start() {
    app.listen(8080);

    const utils = require("./utils");
    global.Tokito.utils = utils;

    console.log(`
      \x1b[33m▀█▀ █▀█ █▄▀ █ ▀█▀ █▀█\x1b[0m
      \x1b[36m░█░ █▄█ █░█ █ ░█░ █▄█\x1b[0m
    `);

    log("SYSTEM", "Initializing Tokito...");
    log("SYSTEM", "Initialized Success...");
    log("SYSTEM", "Deploying Commands...");
    await utils.loadCommands();
    log("SYSTEM", "Deploying Events...");
    await utils.loadEvents();
    log("SYSTEM", "Loading Cookies...");
    log("SYSTEM", "Logging in...");
    const logger = require("./System/login");
    await logger();
}

process.on("SIGINT", () => {
    log("SYSTEM", "Shutting down...");
    process.exit();
});

start();

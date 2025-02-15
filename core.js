const fs = require("fs-extra");
const path = require("path");
const express = require("express");
const app = express();

process.on("unhandledRejection", (error) => log("ERROR", error.stack));
process.on("uncaughtException", (error) => log("ERROR", error.stack));

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
    cooldown: new Map()
},

Object.assign(global.Tokito, {
    get prefix() { return global.Tokito.config.prefix; },
    get maintenance() { return global.Tokito.config.maintenance; },
    get developers() { return global.Tokito.config.developers; },
    get admins() { return global.Tokito.config.admins; },
    get moderator() { return global.Tokito.config.moderator; },
});

function log(type, message) {
    const colors = {
        SYSTEM: "\x1b[36m",
        COMMAND: "\x1b[32m",
        ERROR: "\x1b[31m",
        RESET: "\x1b[0m",
    };
    console.log(`${colors[type] || colors.SYSTEM}[ ${type} ]${colors.RESET} ${message}`);
}

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
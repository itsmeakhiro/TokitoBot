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
        
    }
}

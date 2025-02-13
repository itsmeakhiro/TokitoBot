const api = require("../../Tokito/modules/resources/api");
const express = require("express");
const app = express();

async function apiHandler({ chat, event, args, router, fonts }){
  app.use("", api);
}
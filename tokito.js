// Disclaimer: This function may / has to be in beta version. So please do not intent to modify this file as this is an own developed code by Francis Loyd Raval. Do not MODIFY this if you dont want to global ban you to the website and its bot functionality. This part is where the tokito has access to become a API

const express = require("express");
const crypto = require("crypto");
const router = express.Router();

global.allResolve = new Map();

router.get("/postWReply", async (req, res) => {
  const event = req.query ?? {};
  event.senderID = `web:${event.senderID}`;
  event.threadID = `web:${event.threadID}`;
  event.messageID = `id_${crypto.randomUUID()}`; 

  const botResponse = await new Promise((resolve, reject) => {
    global.allResolve.set(event.messageID, resolve);
  });

  res.json(botResponse);
});

module.exports = router;
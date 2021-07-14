"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { onInit, onExit } = require("./src/lifecycle");
const {
  telegramBot,
  sendMessage,
  checkChatId,
} = require("./src/services/telegram");
const { executeCommand } = require("./src/commands");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/public", express.static("public"));

app.get("/healthCheck", (req, res) => {
  res.send(true);
});

app.post("/telegram_webhook", async (req, res) => {
  const message = req.body.message || req.body.edited_message;

  let data;

  try {
    checkChatId(message.chat.id);
    data = await executeCommand(message.text);
  } catch (e) {
    await telegramBot.sendMessage(message.chat.id, e.message);
    return res.send({ error: e.message });
  }

  await sendMessage(data);
  return res.send({ data });
});

app.listen(5000, () => {
  console.info("Listening @ port 5000");
  onInit();
  onExit();
});

// Express App Setup
"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { onInit, onExit } = require("./src/lifecycle");
const {
  telegramBot,
  sendMessage,
  checkChatId,
  decodeMessage,
} = require("./src/utils/telegram");
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

  let command;
  let data;

  try {
    checkChatId(message.chat.id);
    [command, data] = decodeMessage(message.text);
    data = await executeCommand(command, data);
  } catch (e) {
    await telegramBot.sendMessage(message.chat.id, e.message);
    return res.send({ greet: "bye" });
  }

  await sendMessage(data);

  return res.send({ greet: "hello" });
});

app.listen(5000, () => {
  console.info("Listening @ port 5000");
  onInit();
  onExit();
});

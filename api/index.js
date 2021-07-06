// Express App Setup
"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { TELEGRAM_CHAT_ID } = require("./src/config/constants");
const {
  telegramBot,
  sendMessage,
  checkChatId,
  decodeMessage,
  encodeMessage,
} = require("./src/utils/telegram");
const { executeCommand } = require("./src/utils/commands");

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
    return res.send({greet: "bye"});
  }

  await sendMessage(data);

  return res.send({greet: "hello"});
});

app.listen(5000, (err) => {
  console.log("Listening");
});

"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { onInit, onExit } = require("./src/lifecycle");
const { MessageService } = require("./src/services");
const { executeCommand } = require("./src/commands");
const { decodeCommand } = require("./src/commands/decoder");

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
  let command;

  try {
    MessageService.checkChatId(message.chat.id);
    const decodedCommand = decodeCommand(message.text);
    command = decodedCommand[0];
    data = await executeCommand(decodedCommand);
  } catch (e) {
    await MessageService.sendError(message.chat.id, command, e.message);
    return res.send({ error: e.message });
  }

  await MessageService.sendMessage(data);
  return res.send({ data });
});

app.listen(5000, () => {
  console.info("Listening @ port 5000");
  onInit();
  onExit();
});

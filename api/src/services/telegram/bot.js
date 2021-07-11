const TelegramBot = require("node-telegram-bot-api");
const {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
} = require("../../config/constants");

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

function checkChatId(chatId) {
  if (chatId !== Number(TELEGRAM_CHAT_ID)) {
    throw new Error("Invalid chat origin.");
  }
}

function sendMessage(message) {
  return bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: "Markdown" });
}

module.exports.telegramBot = bot;
module.exports.checkChatId = checkChatId;
module.exports.sendMessage = sendMessage;

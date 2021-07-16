const TelegramBot = require("node-telegram-bot-api");
const {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
} = require("../../config/constants");

class MessageService {
  constructor(token, chatId) {
    this.bot = new TelegramBot(token);
    this.chatId = Number(chatId);
  }

  checkChatId(chatId) {
    if (chatId !== this.chatId) {
      throw new Error("Invalid chat origin.");
    }
  }

  sendMessage(...args) {
    let chatId = this.chatId;
    let [message] = args;

    if (args.length === 2) {
      [chatId, message] = args;
    }

    return this.bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  }

  sendError(command, message) {
    return this.sendMessage(`*[${command} error]*: ${message}`);
  }
}

module.exports.MessageService = new MessageService(
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID
);

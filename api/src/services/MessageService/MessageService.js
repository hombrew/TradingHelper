const TelegramBot = require("node-telegram-bot-api");
const {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  ENVIRONMENT,
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

  sendError(...args) {
    let chatId = this.chatId;
    let [command, message] = args;

    if (args.length === 3) {
      [chatId, command, message] = args;
    }
    return this.sendMessage(
      chatId,
      `*[${command.toLowerCase()} error @ ${ENVIRONMENT}]*:\n\n${message}`
    );
  }
}

module.exports.MessageService = new MessageService(
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID
);

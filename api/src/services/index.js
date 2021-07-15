const MessageService = require("./MessageService");
const ExchangeService = require("./ExchangeService");
const QueueService = require("./QueueService");

module.exports = {
  ...MessageService,
  ...ExchangeService,
  ...QueueService,
};

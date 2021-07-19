const MessageService = require("./MessageService");
const LogService = require("./LogService");
const ExchangeService = require("./ExchangeService");
const QueueService = require("./QueueService");

module.exports = {
  ...MessageService,
  ...LogService,
  ...ExchangeService,
  ...QueueService,
};

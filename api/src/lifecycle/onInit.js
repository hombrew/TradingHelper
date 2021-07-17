const { MessageService } = require("../services");
const { connectDB } = require("../services/db");
const { promiseFind } = require("../utils");
const { QueueService, ExchangeService } = require("../services");
const onEntryFill = require("./onEntryFill");
const onStopLossFill = require("./onStopLossFill");
const onTakeProfitFill = require("./onTakeProfitFill");

function tryEventHandler(event) {
  const { eventType, order } = event;
  const { orderStatus, orderType, symbol } = order;
  const where = `${eventType} ${orderStatus} ${orderType} ${symbol}`;

  return async function ({ condition, handler, responder }) {
    if (!condition(event)) {
      await MessageService.sendMessage(where);
      return;
    }
    try {
      const repsonse = await handler(event);
      return responder(repsonse);
    } catch (e) {
      await MessageService.sendError(where, e.message);
    }
  };
}

QueueService.on((event) => {
  const handlers = [onEntryFill, onStopLossFill, onTakeProfitFill].map(
    tryEventHandler(event)
  );
  return promiseFind(handlers, Boolean);
});

async function onInit() {
  await connectDB();
  ExchangeService.onOrderUpdate(QueueService.add.bind(QueueService));
}

module.exports.onInit = onInit;

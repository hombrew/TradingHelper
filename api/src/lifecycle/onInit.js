const { MessageService } = require("../services");
const { connectDB } = require("../services/db");
const { promiseFind } = require("../utils");
const { QueueService, ExchangeService } = require("../services");
const onEntryFill = require("./onEntryFill");
const onStopLossFill = require("./onStopLossFill");
const onTakeProfitFill = require("./onTakeProfitFill");
const onNew = require("./onNew");
const onCancelled = require("./onCancelled");

function getWhereHappened(event) {
  const { eventType, order } = event;
  const { orderStatus, orderType, symbol } = order;
  return `${eventType} ${orderStatus} ${orderType} ${symbol}`;
}

function tryEventHandler(event) {
  return async function ({ condition, handler, responder }) {
    if (!condition(event)) return;
    try {
      const repsonse = await handler(event);
      return responder(repsonse);
    } catch (e) {
      await MessageService.sendError(getWhereHappened(event), e.message);
    }
  };
}

QueueService.on(async (event) => {
  await MessageService.sendMessage(getWhereHappened(event));
  const handlers = [
    onEntryFill,
    onStopLossFill,
    onTakeProfitFill,
    // onNew,
    // onCancelled,
  ].map(tryEventHandler(event));
  return promiseFind(handlers, Boolean);
});

async function onInit() {
  await connectDB();
  ExchangeService.onOrderUpdate(QueueService.add.bind(QueueService));
}

module.exports.onInit = onInit;

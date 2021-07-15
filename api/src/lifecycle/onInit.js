const { connectDB } = require("../services/db");
const { promiseFind } = require("../utils");
const { QueueService, ExchangeService } = require("../services");
const onEntryFill = require("./onEntryFill");
const onStopLossFill = require("./onStopLossFill");
const onTakeProfitFill = require("./onTakeProfitFill");

function tryEventHandler(event) {
  return async function ({ condition, handler, responder, errorHandler }) {
    if (!condition(event)) return;
    try {
      const repsonse = await handler(event);
      return responder(repsonse);
    } catch (e) {
      if (errorHandler) errorHandler(e);
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

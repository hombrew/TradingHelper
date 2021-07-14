const { binance } = require("../services/binance");
const { connectDB } = require("../services/db");
const { promiseFind } = require("../utils");
const { Queue } = require("./Queue");
const onEntryFill = require("./onEntryFill");
const onStopLossFill = require("./onStopLossFill");

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

Queue.on((event) => {
  const handlers = [onEntryFill, onStopLossFill].map(tryEventHandler(event));
  return promiseFind(handlers, Boolean);
});

async function onInit() {
  await connectDB();

  binance.websockets.userFutureData(
    null, // margin_call_callback
    null, // account_update_callback
    Queue.add.bind(Queue), // order_update_callback
    null, // subscribed_callback
    null // account_config_update_callback
  );
}

module.exports.onInit = onInit;

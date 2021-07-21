const { MessageService } = require("../services");
const { connectDB } = require("../services/db");
const { promiseFind } = require("../utils");
const { QueueService, ExchangeService, LogService } = require("../services");
const onTakeProfitFill = require("./onTakeProfitFill");
const onPositionUpdate = require("./onPositionUpdate");

function tryEventHandler(event) {
  return async function ({ condition, handler, responder }) {
    if (!condition(event)) return;
    try {
      const repsonse = await handler(event);
      return responder(repsonse);
    } catch (e) {
      LogService.error("EVENT ERROR", { event, error: e });
      await MessageService.sendError(event.eventType, e.message);
    }
  };
}

QueueService.on(async (event) => {
  const handlers = [onTakeProfitFill, onPositionUpdate].map(
    tryEventHandler(event)
  );
  return promiseFind(handlers, Boolean);
});

async function onInit() {
  await connectDB();
  ExchangeService.onOrderUpdate(QueueService.add.bind(QueueService));
  ExchangeService.onAccountUpdate(QueueService.add.bind(QueueService));
}

module.exports.onInit = onInit;

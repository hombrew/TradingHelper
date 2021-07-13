const {
  ORDER_TYPE_LIMIT,
  ORDER_STATUS_FILLED,
} = require("../config/binance.contracts");
const { binance } = require("../services/binance");
const { connectDB } = require("../services/db");
const { sendMessage } = require("../services/telegram");
const { encodeCalculateData } = require("../commands/calculate");
const { Queue } = require("./Queue");
const { onEntryFill } = require("./onEntryFill");

Queue.on(async ({ order }) => {
  const isFilledEntry =
    order.orderStatus === ORDER_STATUS_FILLED &&
    order.orderType === ORDER_TYPE_LIMIT;

  try {
    if (isFilledEntry) {
      const responseMessage = await onEntryFill(order);
      await sendMessage(encodeCalculateData(responseMessage));
    }
  } catch (e) {
    await sendMessage(`Queue error: ${e.message}`);
  }
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

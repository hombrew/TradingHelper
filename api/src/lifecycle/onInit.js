const { binance } = require("../utils/binance");
const { Queue } = require("./Queue");

// Queue.on(({ order }) => {

// })

function onInit() {
  binance.websockets.userFutureData(
    null, // margin_call_callback
    null, // account_update_callback
    Queue.add.bind(Queue), // order_update_callback
    null, // subscribed_callback
    null // account_config_update_callback
  );
}

module.exports.onInit = onInit;

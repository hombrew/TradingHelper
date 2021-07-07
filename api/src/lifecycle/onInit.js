const { binance } = require("../utils/binance");

function onInit() {
  binance.websockets.userFutureData(
    console.info.bind(console, "margin_call_callback"),
    console.info.bind(console, "account_update_callback"),
    console.info.bind(console, "order_update_callback"),
    console.info.bind(console, "subscribed_callback"),
    console.info.bind(console, "account_config_update_callback")
  );
}

module.exports.onInit = onInit;

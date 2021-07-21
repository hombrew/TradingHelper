const {
  BINANCE_WS_EVENT_TYPE_ORDER_TRADE_UPDATE,
  ORDER_TYPE_STOP_MARKET,
  ORDER_STATUS_FILLED,
} = require("../../config/binance.contracts");
const { isObject } = require("../../utils");

function onStopLossFillCondition(event) {
  return (
    isObject(event) &&
    event.eventType === BINANCE_WS_EVENT_TYPE_ORDER_TRADE_UPDATE &&
    isObject(event.order) &&
    event.order.originalOrderType === ORDER_TYPE_STOP_MARKET &&
    event.order.orderStatus === ORDER_STATUS_FILLED
  );
}

module.exports = onStopLossFillCondition;

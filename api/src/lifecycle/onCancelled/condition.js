const {
  ORDER_TYPE_STOP_MARKET,
  ORDER_STATUS_CANCELLED,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_TAKE_PROFIT_MARKET,
} = require("../../config/binance.contracts");
const { isObject } = require("../../utils");

function onCancelledCondition(event) {
  if (!(isObject(event) && isObject(event.order))) {
    return false;
  }

  return (
    event.order.orderStatus === ORDER_STATUS_CANCELLED &&
    (event.order.orderType === ORDER_TYPE_LIMIT ||
      event.order.orderType === ORDER_TYPE_STOP_MARKET ||
      event.order.orderType === ORDER_TYPE_TAKE_PROFIT_MARKET)
  );
}

module.exports = onCancelledCondition;

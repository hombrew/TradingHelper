const {
  ORDER_TYPE_STOP,
  ORDER_STATUS_NEW,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_TAKE_PROFIT,
} = require("../../config/binance.contracts");
const { isObject } = require("../../utils");

function onNewCondition(event) {
  if (!(isObject(event) && isObject(event.order))) {
    return false;
  }

  return (
    event.order.orderStatus === ORDER_STATUS_NEW &&
    (event.order.orderType === ORDER_TYPE_LIMIT ||
      event.order.orderType === ORDER_TYPE_STOP ||
      event.order.orderType === ORDER_TYPE_TAKE_PROFIT)
  );
}

module.exports = onNewCondition;

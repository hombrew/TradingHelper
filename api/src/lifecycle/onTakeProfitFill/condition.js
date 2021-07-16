const {
  ORDER_TYPE_TAKE_PROFIT_MARKET,
  ORDER_STATUS_FILLED,
} = require("../../config/binance.contracts");
const { isObject } = require("../../utils");

function onTakeProfitFillCondition(event) {
  if (!(isObject(event) && isObject(event.order))) {
    return false;
  }

  return (
    event.order.orderStatus === ORDER_STATUS_FILLED &&
    event.order.orderType === ORDER_TYPE_TAKE_PROFIT_MARKET
  );
}

module.exports = onTakeProfitFillCondition;

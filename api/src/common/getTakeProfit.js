const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../config/constants");
const { orderAscBy } = require("../utils");

function getTakeProfit(direction, trade) {
  const orders = orderAscBy(trade.takeProfits);
  const tpIndex = trade.direction === direction ? 0 : orders.length - 1;
  return orders[tpIndex];
}

module.exports.getFirstTakeProfit = getTakeProfit.bind(
  null,
  TRADE_DIRECTION_LONG
);
module.exports.getLastTakeProfit = getTakeProfit.bind(
  null,
  TRADE_DIRECTION_SHORT
);

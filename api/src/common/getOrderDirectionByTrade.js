const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../config/constants");
const {
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_STOP_MARKET,
  ORDER_TYPE_TAKE_PROFIT_MARKET,
} = require("../config/binance.contracts");

const orderDirectionMap = {
  [TRADE_DIRECTION_LONG]: {
    [ORDER_TYPE_LIMIT]: TRADE_DIRECTION_LONG,
    [ORDER_TYPE_STOP_MARKET]: TRADE_DIRECTION_SHORT,
    [ORDER_TYPE_TAKE_PROFIT_MARKET]: TRADE_DIRECTION_SHORT,
  },
  [TRADE_DIRECTION_SHORT]: {
    [ORDER_TYPE_LIMIT]: TRADE_DIRECTION_SHORT,
    [ORDER_TYPE_STOP_MARKET]: TRADE_DIRECTION_LONG,
    [ORDER_TYPE_TAKE_PROFIT_MARKET]: TRADE_DIRECTION_LONG,
  },
};

async function getOrderDirectionByTrade(trade, order) {
  return orderDirectionMap[trade.direction][order.type];
}

module.exports.getOrderDirectionByTrade = getOrderDirectionByTrade;

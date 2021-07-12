const {
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_STOP_MARKET,
  ORDER_TYPE_TAKE_PROFIT_MARKET,
  ORDER_STATUS_NEW,
  TRADE_STATUS_CREATED,
} = require("../config/binance.contracts");

function buildOrder(symbol, type, price) {
  const reduceOnly = type !== ORDER_TYPE_LIMIT;
  return {
    symbol,
    price,
    position: 0,
    type,
    reduceOnly,
    status: ORDER_STATUS_NEW,
  };
}

const orderTypeMap = {
  stopLoss: ORDER_TYPE_STOP_MARKET,
  entries: ORDER_TYPE_LIMIT,
  takeProfits: ORDER_TYPE_TAKE_PROFIT_MARKET,
};

function formatUnprocessedTrade(unprocessedTrade) {
  const { symbol } = unprocessedTrade;

  return Object.keys(unprocessedTrade).reduce(
    (trade, key) => {
      const shouldHaveOrders = Boolean(orderTypeMap[key]);
      const isArray = Array.isArray(trade[key]);

      if (shouldHaveOrders) {
        const build = (price) => buildOrder(symbol, orderTypeMap[key], price);

        trade[key] = isArray ? trade[key].map(build) : build(trade[key]);
      }

      return trade;
    },
    { ...unprocessedTrade, status: TRADE_STATUS_CREATED }
  );
}

module.exports.formatUnprocessedTrade = formatUnprocessedTrade;

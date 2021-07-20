const {
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_STOP_MARKET,
  ORDER_TYPE_TAKE_PROFIT_MARKET,
  ORDER_STATUS_NEW,
  TRADE_STATUS_CREATED,
} = require("../../src/config/binance.contracts");
const { TRADE_DIRECTION_LONG } = require("../../src/config/constants");
const { Order, Trade } = require("../../src/services/db");

function createEntry(input = {}) {
  return {
    symbol: "BTCUSDT",
    price: 30000,
    position: 1,
    risked: 1000,
    status: ORDER_STATUS_NEW,
    ...input,
    type: ORDER_TYPE_LIMIT,
    reduceOnly: false,
  };
}

function createStopLoss(input = {}) {
  return {
    symbol: "BTCUSDT",
    price: 30000,
    position: 1,
    risked: 1000,
    status: ORDER_STATUS_NEW,
    ...input,
    type: ORDER_TYPE_STOP_MARKET,
    reduceOnly: true,
  };
}

function createTakeProfit(input = {}) {
  return {
    symbol: "BTCUSDT",
    price: 30000,
    position: 1,
    risked: 1000,
    status: ORDER_STATUS_NEW,
    ...input,
    type: ORDER_TYPE_TAKE_PROFIT_MARKET,
    reduceOnly: true,
  };
}

function createTradeData(input = {}) {
  return {
    symbol: "BTCUSDT",
    direction: TRADE_DIRECTION_LONG,
    risked: 1000,
    status: TRADE_STATUS_CREATED,
    ...input,
  };
}

function createEntryOrder(input = {}) {
  return new Order(createEntry(input));
}

function createStopLossOrder(input = {}) {
  return new Order(createStopLoss(input));
}

function createTakeProfitOrder(input = {}) {
  return new Order(createTakeProfit(input));
}

function findStopLoss(input = {}) {
  return Order.findOne({
    type: ORDER_TYPE_STOP_MARKET,
    ...input,
  });
}

function findTakeProfits(input = {}) {
  return Order.find({
    type: ORDER_TYPE_TAKE_PROFIT_MARKET,
    ...input,
  });
}

function findEntries(input = {}) {
  return Order.find({
    type: ORDER_TYPE_LIMIT,
    ...input,
  });
}

function createTrade(input = {}) {
  return new Trade(createTradeData(input));
}

function findTrade(input = {}) {
  return Trade.findOne({
    ...input,
  });
}

module.exports.createEntry = createEntry;
module.exports.createTakeProfit = createTakeProfit;
module.exports.createStopLoss = createStopLoss;
module.exports.createEntryOrder = createEntryOrder;
module.exports.createStopLossOrder = createStopLossOrder;
module.exports.createTakeProfitOrder = createTakeProfitOrder;
module.exports.findStopLoss = findStopLoss;
module.exports.findTakeProfits = findTakeProfits;
module.exports.findEntries = findEntries;

module.exports.createTradeData = createTradeData;
module.exports.createTrade = createTrade;
module.exports.findTrade = findTrade;

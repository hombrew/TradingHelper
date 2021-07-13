const {
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_STOP_MARKET,
  ORDER_TYPE_TAKE_PROFIT_MARKET,
  ORDER_STATUS_NEW,
  TRADE_STATUS_CREATED,
} = require("../../src/config/binance.contracts");
const { Order, Trade } = require("../../src/services/db");

async function createEntryOrder(input = {}) {
  return new Order({
    symbol: "BTCUSDT",
    price: 30000,
    position: 1,
    risked: 1000,
    status: ORDER_STATUS_NEW,
    ...input,
    type: ORDER_TYPE_LIMIT,
    reduceOnly: false,
  });
}

async function createStopLossOrder(input = {}) {
  return new Order({
    symbol: "BTCUSDT",
    price: 30000,
    position: 1,
    risked: 1000,
    status: ORDER_STATUS_NEW,
    ...input,
    type: ORDER_TYPE_STOP_MARKET,
    reduceOnly: true,
  });
}

async function createTakeProfitOrder(input = {}) {
  return new Order({
    symbol: "BTCUSDT",
    price: 30000,
    position: 1,
    risked: 1000,
    status: ORDER_STATUS_NEW,
    ...input,
    type: ORDER_TYPE_TAKE_PROFIT_MARKET,
    reduceOnly: true,
  });
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
  return new Trade({
    symbol: "BTCUSDT",
    direction: "LONG",
    risked: 1000,
    status: TRADE_STATUS_CREATED,
    ...input,
  });
}

module.exports.createEntryOrder = createEntryOrder;
module.exports.createStopLossOrder = createStopLossOrder;
module.exports.createTakeProfitOrder = createTakeProfitOrder;
module.exports.findStopLoss = findStopLoss;
module.exports.findTakeProfits = findTakeProfits;
module.exports.findEntries = findEntries;

module.exports.createTrade = createTrade;

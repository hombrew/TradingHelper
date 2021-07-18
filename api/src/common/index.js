const cancelOrder = require("./cancelOrder");
const cancelOrdersByStatus = require("./cancelOrdersByStatus");
const closeTrade = require("./closeTrade");
const findOrderAndUpdate = require("./findOrderAndUpdate");
const findTradeAndUpdate = require("./findTradeAndUpdate");
const findTradeById = require("./findTradeById");
const getBreakEven = require("./getBreakEven");
const getOrderDirectionByTrade = require("./getOrderDirectionByTrade");
const getTakeProfit = require("./getTakeProfit");
const upsertOrder = require("./upsertOrder");

module.exports = {
  ...cancelOrder,
  ...cancelOrdersByStatus,
  ...closeTrade,
  ...findOrderAndUpdate,
  ...findTradeAndUpdate,
  ...findTradeById,
  ...getBreakEven,
  ...getTakeProfit,
  ...getOrderDirectionByTrade,
  ...upsertOrder,
};

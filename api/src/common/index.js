const cancelOrder = require("./cancelOrder");
const cancelOrdersByStatus = require("./cancelOrdersByStatus");
const closeTrade = require("./closeTrade");
const createTrade = require("./createTrade");
const deleteOrder = require("./deleteOrder");
const findOrderAndUpdate = require("./findOrderAndUpdate");
const findTradeAndUpdate = require("./findTradeAndUpdate");
const findTradeById = require("./findTradeById");
const getBreakEven = require("./getBreakEven");
const getOrderDirectionByTrade = require("./getOrderDirectionByTrade");
const getTakeProfit = require("./getTakeProfit");
const upsertOrder = require("./upsertOrder");
const setTradeBoundaries = require("./setTradeBoundaries");

module.exports = {
  ...cancelOrder,
  ...cancelOrdersByStatus,
  ...closeTrade,
  ...createTrade,
  ...deleteOrder,
  ...findOrderAndUpdate,
  ...findTradeAndUpdate,
  ...findTradeById,
  ...getBreakEven,
  ...getTakeProfit,
  ...getOrderDirectionByTrade,
  ...upsertOrder,
  ...setTradeBoundaries,
};

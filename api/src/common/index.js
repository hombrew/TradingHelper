const cancelOrder = require("./cancelOrder");
const cancelOrdersByStatus = require("./cancelOrdersByStatus");
const closeTrade = require("./closeTrade");
const createTrade = require("./createTrade");
const deleteOrder = require("./deleteOrder");
const findOrderAndUpdate = require("./findOrderAndUpdate");
const findTrade = require("./findTrade");
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
  ...findTrade,
  ...getBreakEven,
  ...getTakeProfit,
  ...getOrderDirectionByTrade,
  ...upsertOrder,
  ...setTradeBoundaries,
};

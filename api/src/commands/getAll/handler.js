const mongoose = require("mongoose");
const {
  TRADE_STATUS_CREATED,
  TRADE_STATUS_IN_PROGRESS,
} = require("../../config/binance.contracts");

function findAllTrades(input = {}) {
  return mongoose
    .model("Trade")
    .find(input)
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();
}

async function getAllTrades() {
  const createdTrades = await findAllTrades({ status: TRADE_STATUS_CREATED });
  const inProgressTrades = await findAllTrades({
    status: TRADE_STATUS_IN_PROGRESS,
  });

  const allTrades = [...createdTrades, ...inProgressTrades];

  return allTrades;
}

module.exports = getAllTrades;

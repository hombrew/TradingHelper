const mongoose = require("mongoose");

function findTradeById(id) {
  return mongoose
    .model("Trade")
    .findById(id)
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();
}

async function getTrades(tradeIds) {
  const tradePromises = tradeIds.map(findTradeById);

  const trades = await Promise.all(tradePromises);

  if (trades.length === 0) {
    throw new Error("No trades were found");
  }

  return trades;
}

module.exports = getTrades;

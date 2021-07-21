const mongoose = require("mongoose");

function findTradeAndUpdate(query, update) {
  return mongoose
    .model("Trade")
    .findOneAndUpdate(query, update, { new: true })
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();
}

function findTradeById(id) {
  return mongoose
    .model("Trade")
    .findById(id)
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();
}

function findOneTrade(query) {
  return mongoose
    .model("Trade")
    .findOne(query)
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();
}

function findTrades(query) {
  return mongoose
    .model("Trade")
    .find(query)
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();
}

module.exports.findTradeAndUpdate = findTradeAndUpdate;
module.exports.findTradeById = findTradeById;
module.exports.findOneTrade = findOneTrade;
module.exports.findTrades = findTrades;

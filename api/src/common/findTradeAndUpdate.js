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

module.exports.findTradeAndUpdate = findTradeAndUpdate;

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

module.exports.findTradeById = findTradeById;

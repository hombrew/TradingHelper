const mongoose = require("mongoose");

function findOrderAndUpdate(query, update) {
  return mongoose
    .model("Order")
    .findOneAndUpdate(query, update, { new: true })
    .populate("trade")
    .exec();
}

module.exports.findOrderAndUpdate = findOrderAndUpdate;

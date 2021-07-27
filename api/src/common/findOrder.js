const mongoose = require("mongoose");

function findOrders(query) {
  return mongoose.model("Order").find(query).populate("trade").exec();
}

function findOrderAndUpdate(query, update) {
  return mongoose
    .model("Order")
    .findOneAndUpdate(query, update, { new: true })
    .populate("trade")
    .exec();
}

module.exports.findOrders = findOrders;
module.exports.findOrderAndUpdate = findOrderAndUpdate;

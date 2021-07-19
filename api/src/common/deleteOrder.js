const mongoose = require("mongoose");

function deleteOrderById(_id) {
  return mongoose.model("Order").deleteOne({ _id }).exec();
}

function deleteOrder(query) {
  return mongoose.model("Order").deleteOne(query).exec();
}

module.exports.deleteOrderById = deleteOrderById;
module.exports.deleteOrder = deleteOrder;

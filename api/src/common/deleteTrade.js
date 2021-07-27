const mongoose = require("mongoose");

const { deleteOrderById } = require("./deleteOrder");
const { findOrders } = require("./findOrder");

async function deleteTrade(tradeId) {
  const orders = await findOrders({ trade: tradeId });
  await Promise.all(orders.map(({ _id }) => deleteOrderById(_id)));
  await mongoose.model("Trade").deleteOne({ _id: tradeId }).exec();
}

module.exports.deleteTrade = deleteTrade;

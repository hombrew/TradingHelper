const mongoose = require("mongoose");
const {
  contracts,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_TAKE_PROFIT,
  ORDER_TYPE_STOP_MARKET,
} = require("../../../config/binance.contracts");

const { TRADE_DIRECTIONS } = require("../../../config/constants");

const tradeSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    enum: Object.keys(contracts),
  },
  direction: {
    type: String,
    required: true,
    uppercase: true,
    enum: TRADE_DIRECTIONS,
  },
  risked: Number,
  takeProfits: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  entries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  stopLoss: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
});

const option = {
  [ORDER_TYPE_LIMIT]: "entries",
  [ORDER_TYPE_TAKE_PROFIT]: "takeProfits",
  [ORDER_TYPE_STOP_MARKET]: "stopLoss",
};

tradeSchema.methods.addOrder = async function (order) {
  const type = order.type;

  const currentEntries =
    type === ORDER_TYPE_STOP_MARKET
      ? order._id
      : [...(this[option[type]] || []), order._id];

  this[option[type]] = currentEntries;
  order.trade = this._id;
  await order.save();
};

tradeSchema.methods.addOrders = async function (orders) {
  await Promise.all(
    orders.map((order) => {
      this.addOrder(order);
    })
  );
  return this.save();
};

tradeSchema.statics.onEntryFill = async function (entryId) {
  const entry = await mongoose
    .model("Order")
    .findOne({ orderId: entryId })
    .populate({
      path: "trade",
      populate: [{ path: "takeProfits" }, { path: "stopLoss" }],
    })
    .exec();
  const trade = entry.trade;
  console.log("ON ENTRY FILL TRADE", trade);
};

const Trade = mongoose.model("Trade", tradeSchema);

module.exports.Trade = Trade;

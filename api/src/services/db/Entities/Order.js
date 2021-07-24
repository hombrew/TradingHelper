const mongoose = require("mongoose");
const {
  contracts,
  ORDER_TYPES,
  ORDER_STATUS,
} = require("../../../config/binance.contracts");

const orderSchema = new mongoose.Schema({
  orderId: String,
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    enum: Object.keys(contracts),
  },
  price: {
    type: Number,
    required: true,
  },
  position: Number,
  balance: Number,
  minBalance: Number,
  type: {
    type: String,
    required: true,
    uppercase: true,
    enum: ORDER_TYPES,
  },
  status: {
    type: String,
    required: true,
    uppercase: true,
    enum: ORDER_STATUS,
  },
  reduceOnly: Boolean,
  risked: Number,

  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trade",
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports.Order = Order;

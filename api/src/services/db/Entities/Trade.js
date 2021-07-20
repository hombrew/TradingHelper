const mongoose = require("mongoose");
const {
  contracts,
  TRADE_STATUS,
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
  status: {
    type: String,
    uppercase: true,
    enum: TRADE_STATUS,
  },
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

const Trade = mongoose.model("Trade", tradeSchema);

module.exports.Trade = Trade;

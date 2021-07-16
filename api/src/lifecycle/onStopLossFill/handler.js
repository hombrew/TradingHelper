const mongoose = require("mongoose");
const { cancelOrdersByStatus } = require("../../common");
const {
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_NEW,
} = require("../../config/binance.contracts");

async function onStopLossFillHandler(event) {
  const stopLossObj = event.order;

  const stopLoss = await mongoose
    .model("Order")
    .findOneAndUpdate(
      {
        symbol: stopLossObj.symbol,
        type: stopLossObj.orderType,
        price: stopLossObj.originalPrice,
        position: stopLossObj.originalQuantity,
        status: ORDER_STATUS_NEW,
      },
      { status: stopLossObj.orderStatus },
      { new: true }
    )
    .exec();

  if (!stopLoss) {
    return;
  }

  let trade = await mongoose
    .model("Trade")
    .findOneAndUpdate(
      { _id: stopLoss.trade._id },
      { status: TRADE_STATUS_COMPLETED }
    )
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();

  await cancelOrdersByStatus(
    [...trade.entries, ...trade.takeProfits, trade.stopLoss],
    ORDER_STATUS_NEW
  );

  trade = await mongoose
    .model("Trade")
    .findById(trade._id)
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();

  return trade.toObject();
}

module.exports = onStopLossFillHandler;

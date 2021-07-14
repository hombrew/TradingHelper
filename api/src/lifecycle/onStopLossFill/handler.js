const mongoose = require("mongoose");
const { binance } = require("../../services/binance");
const {
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_NEW,
  ORDER_STATUS_CANCELLED,
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

  const trade = await mongoose
    .model("Trade")
    .findOneAndUpdate(
      { _id: stopLoss.trade._id },
      { status: TRADE_STATUS_COMPLETED }
    )
    .exec();

  const nonFilledOrders = await mongoose
    .model("Order")
    .find({
      trade: trade._id,
      status: ORDER_STATUS_NEW,
    })
    .exec();

  for (const order of nonFilledOrders) {
    const { orderId, symbol } = order;
    if (orderId) {
      await binance.futuresCancel(symbol, { orderId });
    }

    order.status = ORDER_STATUS_CANCELLED;
    await order.save();
  }
}

module.exports = onStopLossFillHandler;

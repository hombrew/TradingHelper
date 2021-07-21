const { findOrderAndUpdate, closeTrade } = require("../../common");
const { ORDER_STATUS_CREATED } = require("../../config/binance.contracts");

async function onStopLossFillHandler(event) {
  const stopLossObj = event.order;

  const stopLoss = await findOrderAndUpdate(
    {
      symbol: stopLossObj.symbol,
      type: stopLossObj.originalOrderType,
      price: stopLossObj.stopPrice,
      position: stopLossObj.originalQuantity,
      status: ORDER_STATUS_CREATED,
    },
    { status: stopLossObj.orderStatus }
  );

  if (!stopLoss) {
    return;
  }

  const trade = await closeTrade(stopLoss.trade._id);

  return trade.toObject();
}

module.exports = onStopLossFillHandler;

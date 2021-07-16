const {
  cancelOrdersByStatus,
  findTradeById,
  findOrderAndUpdate,
  findTradeAndUpdate,
} = require("../../common");
const {
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_NEW,
} = require("../../config/binance.contracts");

async function onStopLossFillHandler(event) {
  const stopLossObj = event.order;

  const stopLoss = await findOrderAndUpdate(
    {
      symbol: stopLossObj.symbol,
      type: stopLossObj.orderType,
      price: stopLossObj.originalPrice,
      position: stopLossObj.originalQuantity,
      status: ORDER_STATUS_NEW,
    },
    { status: stopLossObj.orderStatus }
  );

  if (!stopLoss) {
    return;
  }

  let trade = await findTradeAndUpdate(
    { _id: stopLoss.trade._id },
    { status: TRADE_STATUS_COMPLETED }
  );

  await cancelOrdersByStatus(
    [...trade.entries, ...trade.takeProfits, trade.stopLoss],
    ORDER_STATUS_NEW
  );

  trade = await findTradeById(trade._id);

  return trade.toObject();
}

module.exports = onStopLossFillHandler;

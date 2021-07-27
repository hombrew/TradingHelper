const { findOrderAndUpdate, closeTrade } = require("../../common");
const { fixedParseFloat } = require("../../utils");
const { LogService } = require("../../services");
const { ORDER_STATUS_CREATED } = require("../../config/binance.contracts");

async function onStopLossFillHandler(event) {
  const stopLossObj = event.order;

  const stopLoss = await findOrderAndUpdate(
    {
      symbol: stopLossObj.symbol,
      type: stopLossObj.originalOrderType,
      price: fixedParseFloat(stopLossObj.stopPrice),
      position: fixedParseFloat(stopLossObj.originalQuantity),
      status: ORDER_STATUS_CREATED,
    },
    { status: stopLossObj.orderStatus }
  );

  if (!stopLoss) {
    LogService.warn("[ON STOP LOSS FILL ORDER NOT FOUND]", event);
    return;
  }

  const trade = await closeTrade(stopLoss.trade._id);

  return trade.toObject();
}

module.exports = onStopLossFillHandler;

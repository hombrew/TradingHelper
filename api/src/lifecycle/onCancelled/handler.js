const { ExchangeService } = require("../../services");
const { ORDER_STATUS_CANCELLED } = require("../../config/binance.contracts");

async function onCancelledHandler(event) {
  const stopLossObj = event.order;

  ExchangeService.setOrderCancelled({
    symbol: stopLossObj.symbol,
    type: stopLossObj.orderType,
    price: stopLossObj.originalPrice,
    position: stopLossObj.originalQuantity,
    status: ORDER_STATUS_CANCELLED,
  });

  return;
}

module.exports = onCancelledHandler;

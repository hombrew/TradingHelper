const { ExchangeService } = require("../../services");
const { ORDER_STATUS_CREATED } = require("../../config/binance.contracts");

async function onNewHandler(event) {
  const stopLossObj = event.order;

  ExchangeService.setOrderCreated({
    symbol: stopLossObj.symbol,
    type: stopLossObj.orderType,
    price: stopLossObj.originalPrice,
    position: stopLossObj.originalQuantity,
    status: ORDER_STATUS_CREATED,
  });

  return;
}

module.exports = onNewHandler;

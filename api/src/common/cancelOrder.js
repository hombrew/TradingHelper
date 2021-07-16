const { ORDER_STATUS_CANCELLED } = require("../config/binance.contracts");
const { ExchangeService } = require("../services");

async function cancelOrder(order) {
  const { orderId, symbol } = order;

  if (orderId) {
    await ExchangeService.cancelOrder(symbol, { orderId });
  }

  order.status = ORDER_STATUS_CANCELLED;
  await order.save();
}

module.exports.cancelOrder = cancelOrder;

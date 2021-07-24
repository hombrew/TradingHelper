const {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CREATED,
} = require("../../config/binance.contracts");
const { ExchangeService } = require("../../services");
const { Order } = require("../../services/db");

async function cancelOrder(order) {
  order = new Order(order);
  const { orderId, symbol, status } = order;

  if (orderId && status === ORDER_STATUS_CREATED) {
    await ExchangeService.cancelOrder(symbol, { orderId });
  }

  order.status = ORDER_STATUS_CANCELLED;
  await order.save();
}

module.exports.cancelOrder = cancelOrder;

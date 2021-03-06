const {
  ORDER_STATUS_CREATED,
  ORDER_STATUS_NEW,
} = require("../../config/binance.contracts");
const { ExchangeService, LogService } = require("../../services");
const { Order } = require("../../services/db");
const { isObject } = require("../../utils");
const { cancelOrder } = require("../cancelOrder");
const { getOrderDirectionByTrade } = require("../getOrderDirectionByTrade");

async function upsertOrder(directionOrTrade, order) {
  order = new Order(order);

  if (
    order.status !== ORDER_STATUS_CREATED &&
    order.status !== ORDER_STATUS_NEW
  ) {
    throw new Error(
      `Impossible to upsert an order with '${order.status}' order`
    );
  }

  if (isObject(directionOrTrade)) {
    directionOrTrade = getOrderDirectionByTrade(directionOrTrade, order);
  }

  if (order.orderId) {
    await cancelOrder(order);
  }

  const response = await ExchangeService.upsertOrder(
    directionOrTrade,
    order.toObject()
  );

  const logMethod = response.orderId ? "info" : "error";

  LogService[logMethod]("[UPSER ORDER RESPONSE]", response);

  if (!response.orderId) {
    throw new Error(
      `Impossible to add order ${order.symbol} of price ${order.price}`
    );
  }

  order.status = ORDER_STATUS_CREATED;
  order.orderId = String(response.orderId);

  return order.save();
}

module.exports.upsertOrder = upsertOrder;

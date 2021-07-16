const { ExchangeService } = require("../services");
const { isObject } = require("../utils");
const { getOrderDirectionByTrade } = require("./getOrderDirectionByTrade");

async function upsertOrder(direction, order) {
  if (isObject(direction)) {
    direction = getOrderDirectionByTrade(direction, order);
  }

  const { orderId } = await ExchangeService.upsertOrder(
    direction,
    order.toObject()
  );

  order.orderId = String(orderId);

  return order.save();
}

module.exports.upsertOrder = upsertOrder;

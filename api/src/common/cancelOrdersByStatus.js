const { cancelOrder } = require("./cancelOrder");

async function cancelOrdersByStatus(orders, status) {
  const ordersByStatus = orders.filter((order) => order.status === status);

  for (const order of ordersByStatus) {
    await cancelOrder(order);
  }
}

module.exports.cancelOrdersByStatus = cancelOrdersByStatus;

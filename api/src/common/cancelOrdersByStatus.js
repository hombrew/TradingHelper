const { cancelOrder } = require("./cancelOrder");

async function cancelOrdersByStatus(orders, status) {
  const nonFilledEntries = orders
    .filter((order) => order.status === status)
    .map(cancelOrder);

  await Promise.all(nonFilledEntries);
}

module.exports.cancelOrdersByStatus = cancelOrdersByStatus;

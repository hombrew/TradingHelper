const { closeTrade } = require("../../common");

async function closeTrades(tradeIds) {
  const tradePromises = tradeIds.map(async (id) => closeTrade(id, true));
  return Promise.all(tradePromises);
}

module.exports = closeTrades;

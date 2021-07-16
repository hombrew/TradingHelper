const { findTradeById } = require("../../common");

async function getTrades(tradeIds) {
  const tradePromises = tradeIds.map(findTradeById);

  const trades = await Promise.all(tradePromises);

  return trades;
}

module.exports = getTrades;

const { setTradeBoundaries } = require("../../common");

async function verifyTrades(tradeIds) {
  const trades = [];

  for (const tradeId of tradeIds) {
    const trade = await setTradeBoundaries(tradeId);
    trades.push(trade);
  }

  return trades;
}

module.exports = verifyTrades;

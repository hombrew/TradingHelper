const { setTradeBoundaries, fixPositionMargin } = require("../../common");

async function verifyTrades(tradeIds) {
  const trades = [];

  for (const tradeId of tradeIds) {
    const trade = await setTradeBoundaries(tradeId);
    await fixPositionMargin(trade.symbol);
    trades.push(trade);
  }

  return trades;
}

module.exports = verifyTrades;

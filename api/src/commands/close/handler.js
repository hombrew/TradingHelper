const { closeTrade, findTradeById } = require("../../common");

async function closeTrades(tradeIds) {
  const tradePromises = tradeIds.map(async (id) =>
    closeTrade(await findTradeById(id), true)
  );
  await Promise.all(tradePromises);
  return Promise.all(tradeIds.map(findTradeById));
}

module.exports = closeTrades;

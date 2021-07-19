const { createTrade } = require("../../common");
const calculateTradeEntries = require("../calculate").handler;

async function createTradeHandler(unprocessedTrade) {
  const fixedTrade = await calculateTradeEntries(unprocessedTrade);
  return createTrade(fixedTrade);
}

module.exports = createTradeHandler;

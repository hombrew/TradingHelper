const { ExchangeService } = require("../../services");
const { formatUnprocessedTrade } = require("../formatters");

async function calculateTradeEntries(unprocessedTrade) {
  const trade = formatUnprocessedTrade(unprocessedTrade);
  return ExchangeService.fixTrade(trade);
}

module.exports = calculateTradeEntries;

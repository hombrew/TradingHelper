const { TRADE_DIRECTION_LONG } = require("../../config/constants");
const {
  getEntryOrderConfiguration,
  fixTradeConfig,
} = require("../../services/binance");
const { formatUnprocessedTrade } = require("../formatters");

function generateDCAEntryOrders(entries, parts, direction) {
  if (entries.length === 1) return entries;

  if (direction === TRADE_DIRECTION_LONG) {
    const step = (entries[0].price - entries[1].price) / (parts - 1);

    const entryOrders = [...Array(parts - 1).keys()].map((_, index) => {
      const price = entries[0].price - step * (index + 1);
      return { ...entries[0], price };
    });

    return [entries[0], ...entryOrders];
  }

  // SHORT
  const step = (entries[1].price - entries[0].price) / (parts - 1);

  const entryOrders = [...Array(parts - 1).keys()].map((_, index) => {
    const price = entries[0].price + step * (index + 1);
    return { ...entries[0], price };
  });

  return [entries[0], ...entryOrders];
}

function calculateTradeEntries(unprocessedTrade) {
  const trade = formatUnprocessedTrade(unprocessedTrade);
  const { entries, risked, parts, stopLoss, direction } = trade;

  const theoricEntryOrders = generateDCAEntryOrders(entries, parts, direction);
  const riskedPerTrade = risked / theoricEntryOrders.length;

  const entryOrders = theoricEntryOrders.map((entryOrder) => {
    return getEntryOrderConfiguration(
      entryOrder,
      riskedPerTrade,
      direction,
      stopLoss
    );
  });

  const configuredTrade = {
    ...trade,
    entries: entryOrders,
  };

  return fixTradeConfig(configuredTrade);
}

module.exports = calculateTradeEntries;

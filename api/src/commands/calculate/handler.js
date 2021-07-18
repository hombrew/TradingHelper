const { TRADE_DIRECTION_LONG } = require("../../config/constants");
const { ExchangeService } = require("../../services");
const { getBreakEven, getLastBreakEven } = require("../../common");
const { orderDescBy, orderAscBy, truncate } = require("../../utils");
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

function setStopPrices(trade) {
  // stopLoss
  const lastBreakEven = getLastBreakEven(trade);
  trade.stopLoss.stopPrice = lastBreakEven.price;

  // takeProfits
  const breakEven = getBreakEven(trade);
  let takeProfits =
    trade.direction === TRADE_DIRECTION_LONG
      ? orderAscBy(trade.takeProfits, (order) => order.price)
      : orderDescBy(trade.takeProfits, (order) => order.price);
  trade.takeProfits = takeProfits.map((tp, tpIndex, self) => {
    tp.stopPrice =
      tpIndex === 0
        ? truncate((breakEven.price + tp.price) / 2, tp.price)
        : self[tpIndex - 1].price;
    return tp;
  });

  return trade;
}

async function calculateTradeEntries(unprocessedTrade) {
  const trade = formatUnprocessedTrade(unprocessedTrade);
  const { entries, risked, parts, stopLoss, direction } = trade;

  const theoricEntryOrders = generateDCAEntryOrders(entries, parts, direction);
  const riskedPerTrade = risked / theoricEntryOrders.length;

  const entryOrders = theoricEntryOrders.map((entryOrder) => {
    return ExchangeService.prepareEntry(
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

  const fixedTrade = await ExchangeService.fixTrade(configuredTrade);
  return setStopPrices(fixedTrade);
}

module.exports = calculateTradeEntries;

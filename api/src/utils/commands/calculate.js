const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../config/constants");
const {
  getTradeConfiguration,
  getMinimum,
  fixTradeConfig,
} = require("../binance");
const { sendMessage } = require("../telegram");

function generateDCAEntryPrices(ep, parts, direction) {
  if (ep.length === 1) return ep;

  if (direction === TRADE_DIRECTION_LONG) {
    const step = (ep[0] - ep[1]) / (parts - 1);
    const entryPrices = [...Array(parts - 1).keys()].map(
      (_, index) => ep[0] - step * (index + 1)
    );
    return [ep[0], ...entryPrices];
  }

  if (direction === TRADE_DIRECTION_SHORT) {
    const step = (ep[1] - ep[0]) / (parts - 1);
    const entryPrices = [...Array(parts - 1).keys()].map(
      (_, index) => ep[0] + step * (index + 1)
    );
    return [ep[0], ...entryPrices];
  }
}

async function calculateOrder({
  ticker,
  direction,
  risked,
  ep,
  sl,
  parts,
  tp,
}) {
  const minimum = await getMinimum(ticker[0]);

  const entryPrices = generateDCAEntryPrices(ep, parts, direction);
  const riskedPerTrade = risked[0] / entryPrices.length;

  const orders = entryPrices.map((entryPrice) => {
    return getTradeConfiguration(
      ticker[0],
      direction,
      riskedPerTrade,
      entryPrice,
      sl[0]
    );
  });

  const fixedOrders = orders.map((order) =>
    fixTradeConfig(minimum, { ...order, takeProfits: tp })
  );

  return fixedOrders;
}

module.exports.calculateOrder = calculateOrder;

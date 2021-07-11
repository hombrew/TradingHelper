const { binance } = require("./api");
const { getOpenPositions } = require("./position");

function filterBySymbol(list, symbol) {
  return list.filter((item) => item.symbol === symbol);
}

async function getSymbolData(symbol) {
  const [positions, orders] = await Promise.all([
    getOpenPositions(),
    binance.futuresOpenOrders(),
  ]);
  return {
    positions: filterBySymbol(positions, symbol),
    orders: filterBySymbol(orders, symbol),
  };
}

module.exports.getSymbolData = getSymbolData;

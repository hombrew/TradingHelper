const { binance } = require("./api");

async function getMinimums() {
  const data = await binance.futuresExchangeInfo();

  const minimums = data.symbols.reduce((response, symbol) => {
    const filters = symbol.filters.filter(
      ({ filterType }) =>
        filterType === "MIN_NOTIONAL" ||
        filterType === "PRICE_FILTER" ||
        filterType === "LOT_SIZE"
    );

    const symbolData = Object.assign(
      {
        symbol: symbol.symbol,
        status: symbol.status,
        orderTypes: symbol.orderTypes,
      },
      ...filters
    );

    response[symbol.symbol] = symbolData;
    return response;
  }, {});

  return minimums;
}

async function getMinimum(symbol) {
  const minimums = await getMinimums();
  return minimums[symbol.toUpperCase()];
}

module.exports.getMinimums = getMinimums;
module.exports.getMinimum = getMinimum;

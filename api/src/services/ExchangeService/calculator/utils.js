const { BINANCE_CALCULATOR_LIQ_DELTA } = require("../../../config/constants");
const { fixedParseFloat, truncate } = require("../../../utils");

function getNeededMargin(risked, size) {
  return truncate((100 * risked) / BINANCE_CALCULATOR_LIQ_DELTA, size);
}

function getNeededLiquidation(direction, price, stopLoss) {
  return fixedParseFloat(
    price - (100 * (price - stopLoss.price)) / BINANCE_CALCULATOR_LIQ_DELTA
  );
}

function createLeveragedList(from, to) {
  const list = [to];
  while (list[list.length - 1] > from) {
    list.push(list[list.length - 1] - 1);
  }
  return list;
}

function getRowByLeverage(data, leverage) {
  return data.find(
    (currentRow) => leverage >= currentRow[3] && leverage <= currentRow[4]
  );
}

function getRowByNotional(data, notional) {
  return data.find(
    (currentRow) => notional > currentRow[1] && notional <= currentRow[2]
  );
}

module.exports.getNeededMargin = getNeededMargin;
module.exports.getNeededLiquidation = getNeededLiquidation;
module.exports.createLeveragedList = createLeveragedList;
module.exports.getRowByLeverage = getRowByLeverage;
module.exports.getRowByNotional = getRowByNotional;

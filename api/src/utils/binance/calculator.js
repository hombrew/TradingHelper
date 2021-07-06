const { BINANCE_CALCULATOR_LIQ_DELTA } = require("../../config/constants");
const { contracts } = require("../../config/binance.contracts");
const { truncate } = require("../common");

function getNeededMargin(risked) {
  return (100 * risked) / BINANCE_CALCULATOR_LIQ_DELTA;
}

function getNeededLiquidation(direction, price, stopLoss) {
  if (direction === "LONG") {
    return price - (100 * (price - stopLoss)) / BINANCE_CALCULATOR_LIQ_DELTA;
  }

  return price + (100 * (stopLoss - price)) / BINANCE_CALCULATOR_LIQ_DELTA;
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

function getTradeConfiguration(symbol, direction, risked, price, stopLoss) {
  const liquidation = getNeededLiquidation(direction, price, stopLoss);
  const balance = getNeededMargin(risked);

  const data = contracts[symbol];
  const isLong = direction === "LONG";
  const side = isLong ? 1 : -1;
  const minmax = isLong ? "max" : "min";

  const minLeverageAvailable = data[data.length - 1][3];
  const maxLeverageAvailable = data[0][4];
  const leveragedList = createLeveragedList(
    minLeverageAvailable,
    maxLeverageAvailable
  ).filter((leverage) => {
    const row = getRowByLeverage(data, leverage);
    return balance * leverage <= row[2];
  });

  const positionLeverageMap = leveragedList
    .map((leverage) => {
      const notional = balance * leverage;
      const row = getRowByNotional(data, notional);

      const mmr = row[6] / 100;
      const ma = row[7];

      const maxLeveragedPos = (balance * leverage) / price;
      const calculatedLiquidation =
        (balance + ma - side * maxLeveragedPos * price) /
        (maxLeveragedPos * (mmr - side));

      return [leverage, maxLeveragedPos, calculatedLiquidation];
    })
    .filter(([, , calculatedLiquidation]) =>
      side > 0
        ? calculatedLiquidation <= liquidation
        : calculatedLiquidation >= liquidation
    );

  const maxLiquidationAvailable = Math[minmax](
    ...positionLeverageMap.map(
      ([, , calculatedLiquidation]) => calculatedLiquidation
    )
  );

  const [maxLeverage, maxPosition] = positionLeverageMap.find(
    ([, , calculatedLiquidation]) =>
      calculatedLiquidation === maxLiquidationAvailable
  );

  return {
    symbol,
    direction,
    risked,
    price,
    stopLoss,
    leverage: maxLeverage,
    position: maxPosition,
    liquidation: maxLiquidationAvailable,
  };
}

function fixTradeConfig(minimum, order) {
  const { minQty, maxQty, tickSize, stepSize } = minimum;

  if (order.position < minQty) {
    throw new Error(
      `Position size of '${position}' is less than the minimum quantity allowed of ${minQty} per trade`
    );
  }

  if (order.position > maxQty) {
    throw new Error(
      `Position size of '${position}' exceeds the maximum quantity allowed of ${maxQty} per trade`
    );
  }

  const position = truncate(order.position, stepSize);
  const price = truncate(order.price, tickSize);
  const margin = (position * price) / order.leverage;
  const risked = (BINANCE_CALCULATOR_LIQ_DELTA * margin) / 100;

  return {
    ...order,
    position,
    price,
    margin: truncate(margin, tickSize),
    risked: truncate(risked, tickSize),
    stopLoss: truncate(order.stopLoss, tickSize),
    liquidation: truncate(order.liquidation, tickSize),
  };
}

module.exports.getTradeConfiguration = getTradeConfiguration;
module.exports.fixTradeConfig = fixTradeConfig;

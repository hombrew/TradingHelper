const { TRADE_DIRECTION_LONG } = require("../../../config/constants");
const { contracts } = require("../../../config/binance.contracts");
const { truncate, round } = require("../../../utils");
const { generateDCA } = require("./DCA");
const { checkTrade } = require("./fix");
const {
  getNeededMargin,
  getNeededLiquidation,
  createLeveragedList,
  getRowByLeverage,
  getRowByNotional,
} = require("./utils");

function calculateEntry(order, direction, stopLoss, minimum) {
  const { symbol, price, risked } = order;
  const { stepSize } = minimum;

  const liquidation = getNeededLiquidation(direction, price, stopLoss);
  const balance = getNeededMargin(risked, "0.01");

  const data = contracts[symbol];
  const isLong = direction === TRADE_DIRECTION_LONG;
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

      const maxLeveragedPos = truncate(notional / price, stepSize);

      const calculatedLiquidation =
        (balance + ma - side * maxLeveragedPos * price) /
        (maxLeveragedPos * (mmr - side));

      return [leverage, maxLeveragedPos, calculatedLiquidation];
    })
    .filter(([, , calculatedLiquidation]) =>
      isLong
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

  const minBalance = (price * maxPosition) / maxLeverage;

  return {
    ...order,
    balance,
    minBalance: round(minBalance, 2),
    leverage: maxLeverage,
    position: maxPosition,
    liquidation: round(maxLiquidationAvailable, 2),
  };
}

async function calculateTradeValues(trade) {
  const minimum = await this.getMinimum(trade.symbol);
  const entries = generateDCA(trade, minimum).entries.map((order) =>
    calculateEntry(order, trade.direction, trade.stopLoss, minimum)
  );

  return checkTrade({ ...trade, entries }, minimum);
}

module.exports.calculateTradeValues = calculateTradeValues;

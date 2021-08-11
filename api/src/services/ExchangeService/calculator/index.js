/* eslint-disable no-unused-vars */
const { TRADE_DIRECTION_LONG } = require("../../../config/constants");
const { contracts } = require("../../../config/binance.contracts");
const { truncate, round } = require("../../../utils");
const { generateDCA } = require("./DCA");
const { checkTrade } = require("./fix");
const {
  getNeededLiquidation,
  createLeveragedList,
  getRowByNotional,
} = require("./utils");

function calculateEntry(order, direction, stopLoss, minimum) {
  const { symbol, price, risked } = order;
  const { stepSize } = minimum;

  const maxPosition = truncate(
    risked / Math.abs(price - stopLoss.price),
    stepSize
  );
  const notional = maxPosition * price;
  const liquidation = getNeededLiquidation(direction, price, stopLoss);

  const data = contracts[symbol];
  const isLong = direction === TRADE_DIRECTION_LONG;
  const side = isLong ? 1 : -1;

  const row = getRowByNotional(data, notional);
  const mmr = row[6] / 100;
  const ma = row[7];
  const minBalance =
    liquidation * (maxPosition * (mmr - side)) +
    side * maxPosition * price -
    ma;

  const minLeverageAvailable = 1;
  const maxLeverageAvailable = row[4];
  const leveragedList = createLeveragedList(
    minLeverageAvailable,
    maxLeverageAvailable
  );

  const balanceLeverageMap = leveragedList.map((leverage) => {
    const neededBalance = notional / leverage;
    const balance = Math.max(minBalance, neededBalance);

    return [balance, leverage];
  });

  const minCalculatedBalance = Math.min(
    ...balanceLeverageMap.map(([balance]) => balance)
  );
  const filteredBalanceLeverageMap = balanceLeverageMap.filter(
    ([balance]) => balance === minCalculatedBalance
  );
  const minCalculatedLeverage = Math.min(
    ...filteredBalanceLeverageMap.map(([_, leverage]) => leverage)
  );

  const [balance, leverage] = filteredBalanceLeverageMap.find(
    ([_, leverage]) => leverage === minCalculatedLeverage
  );

  return {
    ...order,
    balance: round(balance, 2),
    leverage,
    position: maxPosition,
    liquidation: round(liquidation, 2),
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

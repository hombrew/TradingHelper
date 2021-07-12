const {
  BINANCE_CALCULATOR_LIQ_DELTA,
  TRADE_DIRECTION_LONG,
} = require("../../config/constants");
const { contracts } = require("../../config/binance.contracts");
const { truncate, addBy } = require("../../utils");
const { getMinimum } = require("./minimum");

function getNeededMargin(risked) {
  return (100 * risked) / BINANCE_CALCULATOR_LIQ_DELTA;
}

function getNeededLiquidation(direction, price, stopLoss) {
  if (direction === TRADE_DIRECTION_LONG) {
    return (
      price - (100 * (price - stopLoss.price)) / BINANCE_CALCULATOR_LIQ_DELTA
    );
  }

  return (
    price + (100 * (stopLoss.price - price)) / BINANCE_CALCULATOR_LIQ_DELTA
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

function getEntryOrderConfiguration(entryOrder, risked, direction, stopLoss) {
  const { symbol, price } = entryOrder;

  const liquidation = getNeededLiquidation(direction, price, stopLoss);
  const balance = getNeededMargin(risked);

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

      const maxLeveragedPos = (balance * leverage) / price;
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

  return {
    ...entryOrder,
    leverage: maxLeverage,
    position: maxPosition,
    liquidation: maxLiquidationAvailable,
  };
}

function fixTradeEntries(minimum, entries, takeProfitsLength) {
  const { minQty, maxQty, tickSize, stepSize } = minimum;

  return entries.map((order) => {
    if (order.position < minQty) {
      throw new Error(
        `Position size of '${order.position}' per entry is less than the minimum quantity allowed of ${minQty} per trade`
      );
    }

    if (order.position > maxQty) {
      throw new Error(
        `Position size of '${order.position}' per entry exceeds the maximum quantity allowed of ${maxQty} per trade`
      );
    }

    const position = truncate(order.position, stepSize);
    const price = truncate(order.price, tickSize);
    const margin = (position * price) / order.leverage;
    const risked = (BINANCE_CALCULATOR_LIQ_DELTA * margin) / 100;

    if (truncate(position / takeProfitsLength, stepSize) < minQty) {
      throw new Error(
        `The current position per entry (${position}) cannot be divided between that amount of take profits. Try lowering the amount of take profits or incrementing the amount of risked money.`
      );
    }

    return {
      ...order,
      position,
      price,
      margin: truncate(margin, tickSize),
      risked: truncate(risked, tickSize),
      liquidation: truncate(order.liquidation, tickSize),
    };
  });
}

function fixPrice(minimum, order) {
  const { tickSize } = minimum;
  return {
    ...order,
    price: truncate(order.price, tickSize),
  };
}

async function fixTradeConfig(trade) {
  const minimum = await getMinimum(trade.symbol);
  const takeProfits = trade.takeProfits.map(fixPrice.bind(null, minimum));
  const entries = fixTradeEntries(minimum, trade.entries, takeProfits.length);
  return {
    ...trade,
    risked: addBy(entries, ({ risked }) => risked),
    entries,
    takeProfits,
    stopLoss: fixPrice(minimum, trade.stopLoss),
  };
}

module.exports.getEntryOrderConfiguration = getEntryOrderConfiguration;
module.exports.fixTradeConfig = fixTradeConfig;

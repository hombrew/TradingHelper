const { TRADE_DIRECTION_LONG } = require("../../config/constants");
const { binance } = require("./api");
const { sleep } = require("../common");

async function getOpenPositions() {
  const allPositions = await binance.futuresPositionRisk();
  return allPositions.filter(({ positionAmt }) => Number(positionAmt) > 0);
}

const buy = {
  side: "BUY",
  method: "futuresBuy",
};

const sell = {
  side: "SELL",
  method: "futuresSell",
};

async function openPosition(direction, order) {
  const { symbol, leverage, position, price } = order;
  const [type] = direction === TRADE_DIRECTION_LONG ? [buy, sell] : [sell, buy];

  let response;
  try {
    await binance.futuresMarginType(symbol, "ISOLATED");
    await binance.futuresLeverage(symbol, leverage);
    response = await binance[type.method](symbol, position, price);
  } catch (e) {
    e.order = order;
    throw e;
  }

  await sleep(1000);

  return response;
}

module.exports.getOpenPositions = getOpenPositions;
module.exports.openPosition = openPosition;

const { TRADE_DIRECTION_LONG } = require("../../../config/constants");
const {
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_STOP,
  ORDER_TYPE_TAKE_PROFIT,
} = require("../../../config/binance.contracts");
const { sleep } = require("../../../utils");

// async function getOpenPositions() {
//   const allPositions = await binance.futuresPositionRisk();
//   return allPositions.filter(({ positionAmt }) => Number(positionAmt) > 0);
// }

const buy = {
  side: "BUY",
  method: "futuresBuy",
};

const sell = {
  side: "SELL",
  method: "futuresSell",
};

async function upsertOrder(direction, order) {
  let { symbol, leverage, position, price, type, stopPrice } = order;

  const [orderDirection] =
    direction === TRADE_DIRECTION_LONG ? [buy, sell] : [sell, buy];

  let response;
  try {
    const options = { type };

    if (type === ORDER_TYPE_LIMIT) {
      await this.binance.futuresMarginType(symbol, "ISOLATED");
      await this.binance.futuresLeverage(symbol, leverage);
    }

    if (type === ORDER_TYPE_STOP || type === ORDER_TYPE_TAKE_PROFIT) {
      options.stopPrice = stopPrice;
      options.reduceOnly = true;
    }

    response = await this.binance[orderDirection.method](
      symbol,
      position,
      price,
      options
    );
  } catch (e) {
    e.order = order;
    throw e;
  }

  await sleep(300);

  return response;
}

// module.exports.getOpenPositions = getOpenPositions;
module.exports.upsertOrder = upsertOrder;

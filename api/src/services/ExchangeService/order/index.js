const { TRADE_DIRECTION_LONG } = require("../../../config/constants");
const {
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_STOP_MARKET,
  ORDER_TYPE_TAKE_PROFIT_MARKET,
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
  let { symbol, leverage, position, price, orderId, type } = order;

  const [orderDirection] =
    direction === TRADE_DIRECTION_LONG ? [buy, sell] : [sell, buy];

  let response;
  try {
    if (orderId) {
      await this.binance.futuresCancel(symbol, { orderId });
    }

    const options = { type };

    if (type === ORDER_TYPE_LIMIT) {
      await this.binance.futuresMarginType(symbol, "ISOLATED");
      await this.binance.futuresLeverage(symbol, leverage);
    }

    if (type === ORDER_TYPE_STOP_MARKET) {
      options.closePosition = true;
      options.stopPrice = price;
      price = false;
    }

    if (type == ORDER_TYPE_TAKE_PROFIT_MARKET) {
      options.reduceOnly = true;
      options.stopPrice = price;
      price = false;
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

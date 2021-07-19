const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../../config/constants");

const method = {
  [TRADE_DIRECTION_LONG]: "futuresMarketSell",
  [TRADE_DIRECTION_SHORT]: "futuresMarketBuy",
};

async function closePosition(direction, { symbol, position }) {
  await this.binance[method[direction]](symbol, position, { reduceOnly: true });
}

module.exports.closePosition = closePosition;

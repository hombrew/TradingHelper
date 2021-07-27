const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../../config/constants");
const { LogService } = require("../../LogService");

const method = {
  [TRADE_DIRECTION_LONG]: "futuresMarketSell",
  [TRADE_DIRECTION_SHORT]: "futuresMarketBuy",
};

async function getOpenPositions(symbol) {
  const allPositions = await this.binance.futuresPositionRisk();
  LogService.info("[OPEN POSITIONS]", { symbol, positions: allPositions });
  return allPositions.filter(
    ({ positionAmt, symbol: currentSymbol }) =>
      Number(positionAmt) > 0 && currentSymbol === symbol
  );
}

async function closePosition(direction, { symbol, position }) {
  await this.binance[method[direction]](symbol, position, { reduceOnly: true });
}

module.exports.getOpenPositions = getOpenPositions;
module.exports.closePosition = closePosition;

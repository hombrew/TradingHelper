const {
  TRADE_STATUS_IN_PROGRESS,
  ORDER_STATUS_FILLED,
} = require("../../config/binance.contracts");
const { ExchangeService, LogService } = require("../../services");
const { addBy, fixedParseFloat, round } = require("../../utils");
const { findTrades } = require("../findTrade");

const byFilled = (order) => order.status === ORDER_STATUS_FILLED;
const byPosition = (order) => order.position;
const byBalance = (order) => order.balance;

async function fixPositionMargin(event) {
  const { symbol } = event.order;

  const [position] = await ExchangeService.getOpenPositions(symbol);
  const currentMargin = fixedParseFloat(position.isolatedMargin);

  const trades = await findTrades({ symbol, status: TRADE_STATUS_IN_PROGRESS });
  const neededMargin = trades.reduce((result, trade) => {
    const filledEntries = trade.entries.filter(byFilled);
    const entryPosition = addBy(filledEntries, byPosition);
    const entryMargin = addBy(filledEntries, byBalance);

    const filledTakeProfits = trade.takeProfits.filter(byFilled);
    const takeProfitPosition = addBy(filledTakeProfits, byPosition);

    const margin = fixedParseFloat(
      ((entryPosition - takeProfitPosition) * entryMargin) / entryPosition
    );

    return result + margin;
  }, 0);

  let response = null;
  if (neededMargin > currentMargin) {
    response = await ExchangeService.addPositionMargin(
      symbol,
      round(neededMargin - currentMargin, 2)
    );
  }

  LogService.info(`[${symbol} POSITION MARGIN]`, {
    neededMargin,
    currentMargin,
    response,
  });

  return {
    neededMargin,
    currentMargin,
    response,
  };
}

module.exports.fixPositionMargin = fixPositionMargin;

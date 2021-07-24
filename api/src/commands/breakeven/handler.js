const { TRADE_DIRECTION_LONG } = require("../../config/constants");
const {
  TRADE_STATUS_IN_PROGRESS,
  ORDER_STATUS_CREATED,
} = require("../../config/binance.contracts");
const { ExchangeService } = require("../../services");
const {
  getBreakEven,
  cancelOrdersByStatus,
  upsertOrder,
  findTradeById,
} = require("../../common");

async function takeTradeToBreakeven(tradeId) {
  const trade = await findTradeById(tradeId);

  if (trade.status !== TRADE_STATUS_IN_PROGRESS) {
    throw new Error(
      `Trade /${tradeId} could not be taken to break even becuase it is not in progress.`
    );
  }
  const currentSymbolPrice = await ExchangeService.getPrice(trade.symbol);
  const breakEven = getBreakEven(trade);

  const couldBeMovedToBE =
    trade.direction === TRADE_DIRECTION_LONG
      ? currentSymbolPrice > breakEven.price
      : currentSymbolPrice < breakEven.price;

  if (!couldBeMovedToBE) {
    const position =
      trade.direction === TRADE_DIRECTION_LONG ? "below" : "above";
    throw new Error(
      `Trade /${tradeId} could not be taken to breakeven becuase the current symbol price (${currentSymbolPrice}) is ${position} breakeven price (${breakEven.price})`
    );
  }

  await cancelOrdersByStatus(trade.entries, ORDER_STATUS_CREATED);
  const stopLoss = trade.stopLoss;
  stopLoss.price = breakEven.price;
  await upsertOrder(trade, stopLoss);
}

async function takeTradesToBreakeven(tradeIds) {
  const tradePromises = tradeIds.map(takeTradeToBreakeven);
  await Promise.all(tradePromises);
  return Promise.all(tradeIds.map(findTradeById));
}

module.exports = takeTradesToBreakeven;

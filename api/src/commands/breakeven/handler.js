const mongoose = require("mongoose");
const { TRADE_DIRECTION_LONG } = require("../../config/constants");
const { COMMAND_BREAKEVEN } = require("../../config/commands");
const {
  TRADE_STATUS_IN_PROGRESS,
  ORDER_STATUS_NEW,
} = require("../../config/binance.contracts");
const { ExchangeService, MessageService } = require("../../services");
const {
  getBreakEven,
  cancelOrdersByStatus,
  upsertOrder,
} = require("../../common");

function findTradeById(id) {
  return mongoose
    .model("Trade")
    .findById(id)
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();
}

async function takeTradeToBreakeven(tradeId) {
  const trade = await findTradeById(tradeId);

  if (trade.status !== TRADE_STATUS_IN_PROGRESS) {
    return MessageService.sendError(
      COMMAND_BREAKEVEN,
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
    return MessageService.sendError(
      COMMAND_BREAKEVEN,
      `Trade /${tradeId} could not be taken to breakeven becuase the current symbol price (${currentSymbolPrice}) is ${position} breakeven price (${breakEven.price}) `
    );
  }

  await cancelOrdersByStatus(trade.entries, ORDER_STATUS_NEW);
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

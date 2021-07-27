const {
  ORDER_STATUS_CREATED,
  TRADE_STATUS_CREATED,
  TRADE_STATUS_IN_PROGRESS,
  TRADE_STATUS_COMPLETED,
} = require("../config/binance.contracts");
const { ExchangeService, LogService } = require("../services");
const { isObject } = require("../utils");
const { findTradeById, findTradeAndUpdate } = require("./findTrade");
const { deleteTrade } = require("./deleteTrade");
const { cancelOrdersByStatus } = require("./cancelOrdersByStatus");

async function closeTrade(tradeId, closePosition = false) {
  if (isObject(tradeId)) {
    tradeId = tradeId._id;
  }

  let trade = await findTradeAndUpdate(
    { _id: tradeId },
    { status: TRADE_STATUS_COMPLETED }
  );

  await cancelOrdersByStatus(
    [...trade.entries, ...trade.takeProfits, trade.stopLoss],
    ORDER_STATUS_CREATED
  );

  if (trade.status === TRADE_STATUS_IN_PROGRESS && closePosition) {
    try {
      const response = await ExchangeService.closePosition(
        trade.direction,
        trade.stopLoss
      );
      LogService.info("[EXCHANGE CLOSE POSITION RESPONSE]", {
        tradeId,
        response,
      });
    } catch (error) {
      LogService.error("[EXCHANGE CLOSE POSITION ERROR]", { tradeId, error });
    }
  }

  trade = await findTradeById(tradeId);

  if (trade.status === TRADE_STATUS_CREATED) {
    await deleteTrade(tradeId);
  }

  return trade;
}

module.exports.closeTrade = closeTrade;

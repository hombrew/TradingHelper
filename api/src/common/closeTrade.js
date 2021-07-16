const {
  ORDER_STATUS_NEW,
  TRADE_STATUS_IN_PROGRESS,
  TRADE_STATUS_COMPLETED,
} = require("../config/binance.contracts");
const { ExchangeService } = require("../services");
const { cancelOrdersByStatus } = require("./cancelOrdersByStatus");
const { getOrderDirectionByTrade } = require("./getOrderDirectionByTrade");

async function closeTrade(trade) {
  const initialTradeStatus = trade.status;

  trade.status = TRADE_STATUS_COMPLETED;
  await trade.save();

  await cancelOrdersByStatus(
    [...trade.entries, ...trade.takeProfits, trade.stopLoss],
    ORDER_STATUS_NEW
  );

  if (initialTradeStatus === TRADE_STATUS_IN_PROGRESS) {
    await ExchangeService.closePosition(
      getOrderDirectionByTrade(trade, trade.stopLoss),
      trade.stopLoss
    );
  }
}

module.exports.closeTrade = closeTrade;

const {
  ORDER_STATUS_NEW,
  ORDER_STATUS_CREATED,
  ORDER_STATUS_FILLED,
  TRADE_STATUS_IN_PROGRESS,
} = require("../config/binance.contracts");
const { ExchangeService } = require("../services");
const { findTradeById, findTradeAndUpdate } = require("./findTrade");
const { addBy, truncate, fixedParseFloat } = require("../utils");
const { upsertOrder } = require("./upsertOrder");

const byFilled = (order) => order.status === ORDER_STATUS_FILLED;
const byPosition = (order) => order.position;

async function processOrder(trade, order, position) {
  if (
    order.status === ORDER_STATUS_NEW ||
    order.status === ORDER_STATUS_CREATED
  ) {
    order.position = position;
    await upsertOrder(trade, order);
  }
}

async function setTradeBoundaries(tradeId) {
  let trade = await findTradeAndUpdate(
    { _id: tradeId },
    { status: TRADE_STATUS_IN_PROGRESS },
    { new: true }
  );

  const filledEntries = trade.entries.filter(byFilled);
  const filledEntryPositionSum = addBy(filledEntries, byPosition);

  const filledTakeProfits = trade.takeProfits.filter(byFilled);
  const filledTPPositionSum = addBy(filledTakeProfits, byPosition);

  await processOrder(
    trade,
    trade.stopLoss,
    fixedParseFloat(filledEntryPositionSum - filledTPPositionSum)
  );

  const { stepSize } = await ExchangeService.getMinimum(trade.symbol);

  const theoricPositionPerTP = truncate(
    filledEntryPositionSum / trade.takeProfits.length,
    stepSize
  );

  for (const takeProfit of trade.takeProfits) {
    let position = theoricPositionPerTP;

    if (
      takeProfit.price === trade.takeProfits[trade.takeProfits.length - 1].price
    ) {
      position = fixedParseFloat(
        filledEntryPositionSum -
          theoricPositionPerTP * (trade.takeProfits.length - 1)
      );
    }

    await processOrder(trade, takeProfit, position);
  }

  trade = await findTradeById(tradeId);
  return trade.toObject();
}

module.exports.setTradeBoundaries = setTradeBoundaries;

const {
  ORDER_STATUS_FILLED,
  TRADE_STATUS_IN_PROGRESS,
} = require("../config/binance.contracts");
const { findTradeAndUpdate } = require("./findTradeAndUpdate");
const { findTradeById } = require("./findTradeById");
const { addBy, truncate, fixedParseFloat } = require("../utils");
const { upsertOrder } = require("./upsertOrder");

async function processOrder(trade, order, position) {
  order.position = position;
  await upsertOrder(trade, order);
}

async function setTradeBoundaries(tradeId) {
  let trade = await findTradeAndUpdate(
    { _id: tradeId },
    { status: TRADE_STATUS_IN_PROGRESS },
    { new: true }
  );

  const filledEntries = trade.entries.filter(
    (entry) => entry.status === ORDER_STATUS_FILLED
  );

  const filledEntryPositionSum = addBy(
    filledEntries,
    (entry) => entry.position
  );

  await processOrder(trade, trade.stopLoss, filledEntryPositionSum);

  const theoricPositionPerTP = truncate(
    filledEntryPositionSum / trade.takeProfits.length,
    filledEntryPositionSum
  );

  for (const takeProfit of trade.takeProfits) {
    let position = theoricPositionPerTP;

    if (takeProfit.price === trade.takeProfits[0].price) {
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

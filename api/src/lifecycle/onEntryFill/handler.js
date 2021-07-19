const {
  TRADE_STATUS_IN_PROGRESS,
  ORDER_STATUS_CREATED,
} = require("../../config/binance.contracts");
const { ExchangeService } = require("../../services");
const { truncate, fixedParseFloat } = require("../../utils");
const {
  upsertOrder,
  findOrderAndUpdate,
  findTradeAndUpdate,
  findTradeById,
} = require("../../common");

async function processOrder(trade, order, positionIncrement) {
  order.position = fixedParseFloat(order.position + positionIncrement);
  await upsertOrder(trade, order);
}

async function onEntryFillHandler(event) {
  const entryObj = event.order;

  const { stepSize } = await ExchangeService.getMinimum(entryObj.symbol);

  const entry = await findOrderAndUpdate(
    {
      symbol: entryObj.symbol,
      type: entryObj.orderType,
      price: entryObj.originalPrice,
      position: entryObj.originalQuantity,
      status: ORDER_STATUS_CREATED,
    },
    { status: entryObj.orderStatus }
  );

  if (!entry) {
    return;
  }

  let trade = await findTradeAndUpdate(
    { _id: entry.trade._id },
    { status: TRADE_STATUS_IN_PROGRESS }
  );

  const entryPosition = fixedParseFloat(entryObj.originalQuantity);

  await processOrder(trade, trade.stopLoss, entryPosition);

  const theoricPositionPerTP = truncate(
    entryPosition / trade.takeProfits.length,
    stepSize
  );

  const takeProfitsPromises = trade.takeProfits.map(
    async (takeProfit, index) => {
      let position = theoricPositionPerTP;

      if (index === trade.takeProfits.length - 1) {
        position = fixedParseFloat(
          entryPosition - theoricPositionPerTP * index
        );
      }

      await processOrder(trade, takeProfit, position);
    }
  );

  await Promise.all(takeProfitsPromises);

  trade = await findTradeById(entry.trade._id);

  return trade.toObject();
}

module.exports = onEntryFillHandler;

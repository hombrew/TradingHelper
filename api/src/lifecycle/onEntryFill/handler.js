const mongoose = require("mongoose");
const {
  TRADE_STATUS_IN_PROGRESS,
  ORDER_STATUS_NEW,
} = require("../../config/binance.contracts");
const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../config/constants");
const { ExchangeService } = require("../../services");
const { truncate, fixedParseFloat } = require("../../utils");

async function processOrder(order, direction, positionIncrement) {
  order.position = fixedParseFloat(order.position + positionIncrement);
  const orderResponse = await ExchangeService.upsertOrder(
    direction,
    order.toObject()
  );
  order.orderId = String(orderResponse.orderId);
  await order.save();
}

async function onEntryFillHandler(event) {
  const entryObj = event.order;

  const { stepSize } = await ExchangeService.getMinimum(entryObj.symbol);

  const entry = await mongoose
    .model("Order")
    .findOneAndUpdate(
      {
        symbol: entryObj.symbol,
        type: entryObj.orderType,
        price: entryObj.originalPrice,
        position: entryObj.originalQuantity,
        status: ORDER_STATUS_NEW,
      },
      { status: entryObj.orderStatus },
      { new: true }
    )
    .exec();

  if (!entry) {
    return;
  }

  const trade = await mongoose
    .model("Trade")
    .findById(entry.trade._id)
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();

  trade.status = TRADE_STATUS_IN_PROGRESS;
  await trade.save();

  const nextOrderDirection =
    trade.direction === TRADE_DIRECTION_LONG
      ? TRADE_DIRECTION_SHORT
      : TRADE_DIRECTION_LONG;

  const entryPosition = fixedParseFloat(entryObj.originalQuantity);

  await processOrder(trade.stopLoss, nextOrderDirection, entryPosition);

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

      await processOrder(takeProfit, nextOrderDirection, position);
    }
  );

  await Promise.all(takeProfitsPromises);
  return trade.toObject();
}

module.exports = onEntryFillHandler;

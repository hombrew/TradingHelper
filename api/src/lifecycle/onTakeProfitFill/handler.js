const mongoose = require("mongoose");
const { ExchangeService } = require("../../services");
const { fixedParseFloat } = require("../../utils");
const {
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_NEW,
  ORDER_STATUS_CANCELLED,
} = require("../../config/binance.contracts");

const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../config/constants");

async function onLastTakeProfitFillHandler(tradeId) {
  await mongoose
    .model("Trade")
    .findOneAndUpdate({ _id: tradeId }, { status: TRADE_STATUS_COMPLETED })
    .exec();

  const nonFilledOrders = await mongoose
    .model("Order")
    .find({
      trade: tradeId,
      status: ORDER_STATUS_NEW,
    })
    .exec();

  for (const order of nonFilledOrders) {
    const { orderId, symbol } = order;
    if (orderId) {
      await ExchangeService.cancelOrder(symbol, { orderId });
    }

    order.status = ORDER_STATUS_CANCELLED;
    await order.save();
  }
}

function getBreakEven(trade) {
  const entries = [...trade.entries];
  entries.sort((entryA, entryB) => entryA.price - entryB.price);
  const beIndex =
    trade.direction === TRADE_DIRECTION_LONG ? entries.length - 1 : 0;
  return entries[beIndex];
}

async function onOtherTakeProfitFillHandler(trade, takeProfit) {
  const stopLoss = trade.stopLoss;
  const breakEven = getBreakEven(trade);

  const orderList = [...trade.takeProfits, breakEven, stopLoss];
  orderList.sort((orderA, orderB) => orderA.price - orderB.price);

  const tpIndex = orderList.findIndex(
    (order) => order.price === takeProfit.price
  );
  const slIndex = orderList.findIndex(
    (order) => order.price === stopLoss.price
  );

  if (Math.abs(tpIndex - slIndex) > 2) {
    const nextPriceIndex = tpIndex < slIndex ? tpIndex + 2 : tpIndex - 2;
    stopLoss.price = orderList[nextPriceIndex].price;

    const nonFilledEntries = trade.entries
      .filter((entry) => entry.status === ORDER_STATUS_NEW)
      .map(async (entry) => {
        const { symbol, orderId } = entry;
        if (orderId) {
          await ExchangeService.cancelOrder(symbol, { orderId });
        }

        entry.status = ORDER_STATUS_CANCELLED;
        await entry.save();
      });

    await Promise.all(nonFilledEntries);
  }

  const stopLossDirection =
    trade.direction === TRADE_DIRECTION_LONG
      ? TRADE_DIRECTION_SHORT
      : TRADE_DIRECTION_LONG;

  stopLoss.position = fixedParseFloat(stopLoss.position - takeProfit.position);
  const { orderId } = await ExchangeService.upsertOrder(
    stopLossDirection,
    stopLoss.toObject()
  );
  stopLoss.orderId = orderId;
  await stopLoss.save();
}

function getFullTradeById(tradeId) {
  return mongoose
    .model("Trade")
    .findById(tradeId)
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();
}

function isLastTakeProfit(trade, takeProfit) {
  const takeProfitPrices = trade.takeProfits.map((tp) => tp.price);
  const minmax = trade.direction === TRADE_DIRECTION_LONG ? "max" : "min";
  return Math[minmax](...takeProfitPrices) === takeProfit.price;
}

async function onTakeProfitFillHandler(event) {
  const takeProfitObj = event.order;

  const takeProfit = await mongoose
    .model("Order")
    .findOneAndUpdate(
      {
        symbol: takeProfitObj.symbol,
        type: takeProfitObj.orderType,
        price: takeProfitObj.originalPrice,
        position: takeProfitObj.originalQuantity,
        status: ORDER_STATUS_NEW,
      },
      { status: takeProfitObj.orderStatus },
      { new: true }
    )
    .exec();

  if (!takeProfit) {
    return;
  }

  let trade = await getFullTradeById(takeProfit.trade._id);

  if (isLastTakeProfit(trade, takeProfit)) {
    await onLastTakeProfitFillHandler(trade._id);
  } else {
    await onOtherTakeProfitFillHandler(trade, takeProfit);
  }

  trade = await getFullTradeById(trade._id);

  return trade.toObject();
}

module.exports = onTakeProfitFillHandler;

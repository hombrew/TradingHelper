const mongoose = require("mongoose");
const { fixedParseFloat } = require("../../utils");
const {
  getBreakEven,
  cancelOrdersByStatus,
  upsertOrder,
  cancelOrder,
} = require("../../common");
const {
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_NEW,
} = require("../../config/binance.contracts");

const { TRADE_DIRECTION_LONG } = require("../../config/constants");

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
    await cancelOrder(order);
  }
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

    await cancelOrdersByStatus(trade.entries, ORDER_STATUS_NEW);
  }

  stopLoss.position = fixedParseFloat(stopLoss.position - takeProfit.position);
  await upsertOrder(trade, stopLoss);
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

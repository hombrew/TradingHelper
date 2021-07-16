const { fixedParseFloat } = require("../../utils");
const {
  getBreakEven,
  cancelOrdersByStatus,
  upsertOrder,
  findOrderAndUpdate,
  findTradeById,
  findTradeAndUpdate,
} = require("../../common");
const {
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_NEW,
} = require("../../config/binance.contracts");

const { TRADE_DIRECTION_LONG } = require("../../config/constants");

async function onLastTakeProfitFillHandler(tradeId) {
  const trade = await findTradeAndUpdate(
    { _id: tradeId },
    { status: TRADE_STATUS_COMPLETED }
  );

  await cancelOrdersByStatus(
    [...trade.entries, ...trade.takeProfits, trade.stopLoss],
    ORDER_STATUS_NEW
  );
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

function isLastTakeProfit(trade, takeProfit) {
  const takeProfitPrices = trade.takeProfits.map((tp) => tp.price);
  const minmax = trade.direction === TRADE_DIRECTION_LONG ? "max" : "min";
  return Math[minmax](...takeProfitPrices) === takeProfit.price;
}

async function onTakeProfitFillHandler(event) {
  const takeProfitObj = event.order;

  const takeProfit = await findOrderAndUpdate(
    {
      symbol: takeProfitObj.symbol,
      type: takeProfitObj.orderType,
      price: takeProfitObj.originalPrice,
      position: takeProfitObj.originalQuantity,
      status: ORDER_STATUS_NEW,
    },
    { status: takeProfitObj.orderStatus }
  );

  if (!takeProfit) {
    return;
  }

  let trade = await findTradeById(takeProfit.trade._id);

  if (isLastTakeProfit(trade, takeProfit)) {
    await onLastTakeProfitFillHandler(trade._id);
  } else {
    await onOtherTakeProfitFillHandler(trade, takeProfit);
  }

  trade = await findTradeById(trade._id);

  return trade.toObject();
}

module.exports = onTakeProfitFillHandler;

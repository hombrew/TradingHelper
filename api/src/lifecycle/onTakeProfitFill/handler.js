const {
  getBreakEven,
  cancelOrdersByStatus,
  upsertOrder,
  findOrderAndUpdate,
  findTradeById,
  closeTrade,
} = require("../../common");
const { uniqBy, fixedParseFloat } = require("../../utils");
const { LogService } = require("../../services");
const { ORDER_STATUS_CREATED } = require("../../config/binance.contracts");
const { TRADE_DIRECTION_LONG } = require("../../config/constants");

async function onOtherTakeProfitFillHandler(trade, takeProfit) {
  const stopLoss = trade.stopLoss;
  const breakEven = getBreakEven(trade);

  const orderList = uniqBy(
    [...trade.takeProfits, breakEven, stopLoss],
    (order) => order.price
  );

  orderList.sort((orderA, orderB) => orderA.price - orderB.price);

  const tpIndex = orderList.findIndex(
    ({ price }) => price === takeProfit.price
  );
  const slIndex = orderList.findIndex(({ price }) => price === stopLoss.price);

  if (Math.abs(tpIndex - slIndex) > 2) {
    const nextPriceIndex = tpIndex < slIndex ? tpIndex + 2 : tpIndex - 2;
    stopLoss.price = orderList[nextPriceIndex].price;
    await cancelOrdersByStatus(trade.entries, ORDER_STATUS_CREATED);
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
      type: takeProfitObj.originalOrderType,
      price: fixedParseFloat(takeProfitObj.stopPrice),
      position: fixedParseFloat(takeProfitObj.originalQuantity),
      status: ORDER_STATUS_CREATED,
    },
    { status: takeProfitObj.orderStatus }
  );

  if (!takeProfit) {
    LogService.warn("[ON TAKE PROFIT FILL ORDER NOT FOUND]", event);
    return;
  }

  let trade = await findTradeById(takeProfit.trade._id);

  if (isLastTakeProfit(trade, takeProfit)) {
    await closeTrade(trade._id);
  } else {
    await onOtherTakeProfitFillHandler(trade, takeProfit);
  }

  trade = await findTradeById(trade._id);

  return trade.toObject();
}

module.exports = onTakeProfitFillHandler;

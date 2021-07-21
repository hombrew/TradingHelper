const {
  TRADE_STATUS_IN_PROGRESS,
  ORDER_STATUS_FILLED,
  ORDER_STATUS_CREATED,
} = require("../../config/binance.contracts");
const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../config/constants");
const { ExchangeService } = require("../../services");
const {
  findTrades,
  findTradeById,
  getBreakEven,
  cancelOrdersByStatus,
  upsertOrder,
  closeTrade,
} = require("../../common");
const {
  addBy,
  fixedParseFloat,
  orderAscBy,
  orderDescBy,
  uniqBy,
} = require("../../utils");

const byFilled = (order) => order.status === ORDER_STATUS_FILLED;
const byCreated = (order) => order.status === ORDER_STATUS_CREATED;
const byPosition = (order) => order.position;
const byPrice = (order) => order.price;

async function onOtherTakeProfitFillHandler(trade, takeProfit) {
  const stopLoss = trade.stopLoss;
  const breakEven = getBreakEven(trade);

  const orderList = orderAscBy(
    uniqBy([...trade.takeProfits, breakEven, stopLoss], byPrice),
    byPrice
  );

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
  return findTradeById(trade._id);
}

const byDirection = {
  [TRADE_DIRECTION_LONG]: {
    orderBy: orderAscBy,
  },
  [TRADE_DIRECTION_SHORT]: {
    orderBy: orderDescBy,
  },
};

async function handleTrade(trade, position) {
  // check if position is === entries - take profits
  const filledEntries = trade.entries.filter(byFilled);
  const filledEntriesSum = addBy(filledEntries, byPosition);
  const filledTakeProfits = trade.takeProfits.filter(byFilled);
  const filledTakeProfitsSum = addBy(filledTakeProfits, byPosition);
  const currentlyFilledInTrade = fixedParseFloat(
    filledEntriesSum - filledTakeProfitsSum
  );

  if (position >= currentlyFilledInTrade) {
    return;
  }

  const waitingTakeProfits = byDirection[trade.direction].orderBy(
    trade.takeProfits.filter(byCreated),
    byPrice
  );

  if (
    // check if stop loss
    fixedParseFloat(currentlyFilledInTrade - trade.stopLoss.position) ===
      position &&
    waitingTakeProfits.length > 1
  ) {
    trade.stopLoss.status = ORDER_STATUS_FILLED;
    await trade.stopLoss.save();
    return closeTrade(trade._id);
  }

  if (
    // check if take profit
    fixedParseFloat(currentlyFilledInTrade - waitingTakeProfits[0].position) ===
      position &&
    waitingTakeProfits.length > 1
  ) {
    waitingTakeProfits[0].status = ORDER_STATUS_FILLED;
    await waitingTakeProfits[0].save();
    return onOtherTakeProfitFillHandler(trade, waitingTakeProfits[0]);
  }

  if (
    // check if last TP or SL
    waitingTakeProfits.length === 1 &&
    waitingTakeProfits[0].position === trade.stopLoss.position
  ) {
    const price = await ExchangeService.getPrice(trade.symbol);
    if (
      Math.abs(price - waitingTakeProfits[0].price) <
      Math.abs(price - trade.stopLoss.price)
    ) {
      waitingTakeProfits[0].status = ORDER_STATUS_FILLED;
      await waitingTakeProfits[0].save();
    } else {
      trade.stopLoss.status = ORDER_STATUS_FILLED;
      await trade.stopLoss.save();
    }
    return closeTrade(trade._id);
  }
}

async function onPositionUpdateHandler(event) {
  let responses = [];

  for (const position of event.updateData.positions) {
    const { symbol, positionAmount } = position;
    const trades = await findTrades({
      symbol,
      status: TRADE_STATUS_IN_PROGRESS,
    });

    for (const trade of trades) {
      const response = await handleTrade(
        trade,
        Math.abs(fixedParseFloat(positionAmount))
      );
      responses.push(response);
    }
  }

  return responses;
}

module.exports = onPositionUpdateHandler;

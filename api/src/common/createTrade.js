const { TRADE_STATUS_CREATED } = require("../config/binance.contracts");
const { TRADE_DIRECTION_LONG } = require("../config/constants");
const { ExchangeService } = require("../services");
const { Trade, Order } = require("../services/db");
const { upsertOrder } = require("./upsertOrder");
const { deleteOrder } = require("./deleteOrder");
const { getBreakEven } = require("./getBreakEven");
const { findTradeById } = require("./findTrade");

function deleteOrders(orderList) {
  return Promise.all(orderList.map(deleteOrder));
}

async function addListOfOrders(trade, orders) {
  if (!Array.isArray(orders)) {
    orders = [orders];
  }

  const addedOrders = [];

  for (const order of orders) {
    order.trade = trade._id;
    try {
      const response = await upsertOrder(trade, order);
      addedOrders.push(response);
    } catch (e) {
      await deleteOrders(addedOrders);
      throw e;
    }
  }

  return addedOrders;
}

async function saveListOfOrders(trade, orders) {
  if (!Array.isArray(orders)) {
    orders = [orders];
  }

  return Promise.all(
    orders.map(async (order) => {
      order.trade = trade._id;
      const currentOrder = new Order(order);
      return currentOrder.save();
    })
  );
}

async function checkPrice(trade) {
  const price = await ExchangeService.getPrice(trade.symbol);
  const breakEven = getBreakEven(trade);
  const hasValidPrice =
    trade.direction === TRADE_DIRECTION_LONG
      ? breakEven.price < price
      : breakEven.price > price;

  if (!hasValidPrice) {
    throw new Error("Current price is already beteween your entries.");
  }
}

async function createTrade(tradeObj) {
  await checkPrice(tradeObj);

  const {
    stopLoss: stopLossObj,
    takeProfits: takeProfitsArray,
    entries: entriesArray,
    ...tradeBody
  } = tradeObj;
  const trade = new Trade(tradeBody);

  let stopLossList = [];
  let takeProfitsList = [];
  let entriesList = [];

  try {
    trade.status = TRADE_STATUS_CREATED;
    entriesList = await addListOfOrders(trade, entriesArray);
    stopLossList = await saveListOfOrders(trade, stopLossObj);
    takeProfitsList = await saveListOfOrders(trade, takeProfitsArray);

    trade.stopLoss = stopLossList[0];
    trade.takeProfits = takeProfitsList;
    trade.entries = entriesList;
    await trade.save();
    return findTradeById(trade._id);
  } catch (e) {
    await deleteOrders([...stopLossList, ...takeProfitsList, ...entriesList]);
    throw e;
  }
}

module.exports.createTrade = createTrade;

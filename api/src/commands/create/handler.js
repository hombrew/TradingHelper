const { ExchangeService } = require("../../services");
const { getBreakEven } = require("../../common");
const { TRADE_DIRECTION_LONG } = require("../../config/constants");
const { Trade, Order } = require("../../services/db");
const calculateTradeEntries = require("../calculate").handler;

async function addExchangeOrders(direction, orders) {
  let ordersResponses = [];
  for (const order of orders) {
    try {
      const response = await ExchangeService.upsertOrder(direction, order);
      ordersResponses.push({ ...order, orderId: response.orderId });
    } catch (e) {
      throw new Error(
        `Order ${e.order.symbol} of ${e.order.price} failed. Error: ${e.message}`
      );
    }
  }

  return ordersResponses;
}

async function saveTrade(tradeData) {
  const {
    entries: entriesData,
    stopLoss: stopLossData,
    takeProfits: trakeProfitsData,
    ...restTradeData
  } = tradeData;

  const trade = new Trade(restTradeData);
  const entries = entriesData.map((order) => new Order(order));
  const takeProfits = trakeProfitsData.map((order) => new Order(order));
  const stopLoss = new Order(stopLossData);
  await trade.addOrders([...entries, ...takeProfits, stopLoss]);
  const tradeObj = await Trade.findById(trade._id)
    .populate("entries")
    .populate("stopLoss")
    .populate("takeProfits")
    .exec();
  return tradeObj.toObject();
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

async function createTrade(unprocessedTrade) {
  const fixedTrade = await calculateTradeEntries(unprocessedTrade);
  await checkPrice(fixedTrade);

  const ordersResponses = await addExchangeOrders(
    fixedTrade.direction,
    fixedTrade.entries
  );

  fixedTrade.entries = ordersResponses;
  return saveTrade(fixedTrade);
}

module.exports = createTrade;

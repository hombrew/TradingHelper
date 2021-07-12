const { upsertOrder } = require("../../services/binance");
const { sendMessage } = require("../../services/telegram");
const { Trade, Order } = require("../../services/db");
const { calculateTradeEntries } = require("../calculate");

async function addBinanceOrders(direction, orders) {
  let ordersResponses = [];
  for (const order of orders) {
    try {
      const response = await upsertOrder(direction, order);
      ordersResponses.push({ ...order, orderId: response.orderId });
    } catch (e) {
      throw new Error(
        `Order ${e.order.symbol} of ${e.order.price} failed. Error: ${e.message}`
      );
    }
  }

  await sendMessage(`Orders created successfully`);
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

async function createTrade(unprocessedTrade) {
  const { symbol } = unprocessedTrade;
  await sendMessage(`Starting to create ${symbol} trade`);

  const fixedTrade = await calculateTradeEntries(unprocessedTrade);

  const ordersResponses = await addBinanceOrders(
    fixedTrade.direction,
    fixedTrade.entries
  );

  fixedTrade.entries = ordersResponses;
  return saveTrade(fixedTrade);
}

module.exports.createTrade = createTrade;

const db = require("./db");
const { ExchangeService } = require("../src/services");
const { handler: createTrade } = require("../src/commands/create");
const { handler: onEntryFillHandler } = require("../src/lifecycle/onEntryFill");
const {
  handler: onTakeProfitFillHandler,
} = require("../src/lifecycle/onTakeProfitFill");
const {
  handler: onStopLossFillHandler,
} = require("../src/lifecycle/onStopLossFill");

/**
 * ENTRY HELPERS
 */
async function expectEntryStatusToBe(input = {}, status) {
  const entries = await db.data.findEntries(input);
  expect(entries[0].status).toBe(status);
}

async function onEntryFillByEntryOrder(input = {}, event = {}) {
  const filledOrders = await db.data.findEntries(input);
  const filledOrderEvent = db.events.filledOrder({
    ...filledOrders[0].toObject(),
    ...event,
  });
  return onEntryFillHandler(filledOrderEvent);
}

module.exports.expectEntryStatusToBe = expectEntryStatusToBe;
module.exports.onEntryFillByEntryOrder = onEntryFillByEntryOrder;

/**
 * STOP LOSS HELPERS
 */

async function expectStopLossStatusToBe(input = {}, status) {
  const stopLoss = await db.data.findStopLoss(input);
  expect(stopLoss.status).toBe(status);
}

async function expectStopLossPositionToBe(input = {}, position) {
  const stopLoss = await db.data.findStopLoss(input);
  expect(stopLoss.position).toBe(position);
}

async function expectStopLossPriceToBe(input = {}, price) {
  const stopLoss = await db.data.findStopLoss(input);
  expect(stopLoss.price).toBe(price);
}

async function onStopLossFillByStopLossOrder(input = {}) {
  const filledOrder = await db.data.findStopLoss(input);
  const filledOrderEvent = db.events.filledOrder(filledOrder.toObject());
  return onStopLossFillHandler(filledOrderEvent);
}

module.exports.expectStopLossStatusToBe = expectStopLossStatusToBe;
module.exports.expectStopLossPositionToBe = expectStopLossPositionToBe;
module.exports.expectStopLossPriceToBe = expectStopLossPriceToBe;
module.exports.onStopLossFillByStopLossOrder = onStopLossFillByStopLossOrder;

/**
 * TAKE PROFIT HELPERS
 */

async function expectTakeProfitStatusToBe(input = {}, status) {
  const takeProfits = await db.data.findTakeProfits(input);
  expect(takeProfits[0].status).toBe(status);
}

async function onTakeProfitFillByTakeProfitOrder(input = {}) {
  const filledOrders = await db.data.findTakeProfits(input);
  const filledOrderEvent = db.events.filledOrder(filledOrders[0].toObject());
  return onTakeProfitFillHandler(filledOrderEvent);
}

module.exports.expectTakeProfitStatusToBe = expectTakeProfitStatusToBe;
module.exports.onTakeProfitFillByTakeProfitOrder =
  onTakeProfitFillByTakeProfitOrder;

/**
 * TRADE HELPERS
 */

async function expectTradeStatusToBe(input = {}, status) {
  const trade = await db.data.findTrade(input);
  expect(trade.status).toBe(status);
}

function commandCreateLongTrade(input = {}) {
  ExchangeService.getPrice.mockImplementationOnce(() => 34000);
  return createTrade({
    symbol: "BTCUSDT",
    direction: "LONG",
    entries: [31000, 30000],
    risked: 100,
    parts: 3,
    stopLoss: 29000,
    takeProfits: [33000, 34000, 35000],
    ...input,
  });
}

function commandCreateShortTrade(input = {}) {
  ExchangeService.getPrice.mockImplementationOnce(() => 30000);
  return createTrade({
    symbol: "BTCUSDT",
    direction: "SHORT",
    entries: [33000, 35000],
    risked: 100,
    parts: 3,
    stopLoss: 36000,
    takeProfits: [31000, 30500, 30000],
    ...input,
  });
}

module.exports.expectTradeStatusToBe = expectTradeStatusToBe;
module.exports.commandCreateLongTrade = commandCreateLongTrade;
module.exports.commandCreateShortTrade = commandCreateShortTrade;

const { db } = require("../../../test.helpers");
const {
  TRADE_STATUS_IN_PROGRESS,
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_NEW,
  ORDER_STATUS_CANCELLED,
} = require("../../config/binance.contracts");
const { handler: createTrade } = require("../../commands/create");
const { handler: onEntryFillHandler } = require("../onEntryFill");
const { handler: onTakeProfitFillHandler } = require(".");

jest.mock("../../services/ExchangeService/ExchangeService");
jest.mock("../../services/MessageService/MessageService");

async function expectEntryStatusToBe(input = {}, status) {
  const entries = await db.data.findEntries(input);
  expect(entries[0].status).toBe(status);
}

async function expectStopLossStatusToBe(status) {
  const stopLoss = await db.data.findStopLoss();
  expect(stopLoss.status).toBe(status);
}

async function expectStopLossPositionToBe(status) {
  const stopLoss = await db.data.findStopLoss();
  expect(stopLoss.position).toBe(status);
}

async function expectTradeStatusToBe(status) {
  const trade = await db.data.findTrade();
  expect(trade.status).toBe(status);
}

async function onTakeProfitFillByTakeProfitOrder(input = {}) {
  const filledOrders = await db.data.findTakeProfits(input);
  const filledOrderEvent = db.events.filledOrder(filledOrders[0].toObject());
  return onTakeProfitFillHandler(filledOrderEvent);
}

async function onEntryFillByEntryOrder(input = {}) {
  const filledOrders = await db.data.findEntries(input);
  const filledOrderEvent = db.events.filledOrder(filledOrders[0].toObject());
  return onEntryFillHandler(filledOrderEvent);
}

function commandCreateLongTrade(input = {}) {
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

describe("onTakeProfitFillHandler", () => {
  let connection;

  beforeAll(async () => {
    connection = await db.connection();
    await connection.connect();
  });

  afterEach(async () => await connection.clearDatabase());
  afterAll(async () => await connection.closeDatabase());

  describe("LONG", () => {
    it("should reduce stopLoss position size on takeProfit fill", async () => {
      await commandCreateLongTrade();
      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });

      await expectStopLossPositionToBe(0.034);

      await onTakeProfitFillByTakeProfitOrder({ price: 33000 });
      await expectStopLossPositionToBe(0.024);

      await onTakeProfitFillByTakeProfitOrder({ price: 34000 });
      await expectStopLossPositionToBe(0.014);
    });

    it("should close current trade and its pending orders", async () => {
      await commandCreateLongTrade();
      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });
      await onEntryFillByEntryOrder({ price: 30000 });

      await onTakeProfitFillByTakeProfitOrder({ price: 33000 });
      await expectTradeStatusToBe(TRADE_STATUS_IN_PROGRESS);
      await expectStopLossStatusToBe(ORDER_STATUS_NEW);

      await onTakeProfitFillByTakeProfitOrder({ price: 34000 });
      await expectTradeStatusToBe(TRADE_STATUS_IN_PROGRESS);
      await expectStopLossStatusToBe(ORDER_STATUS_NEW);

      await onTakeProfitFillByTakeProfitOrder({ price: 35000 });
      await expectTradeStatusToBe(TRADE_STATUS_COMPLETED);
      await expectStopLossStatusToBe(ORDER_STATUS_CANCELLED);
    });
  });

  describe("SHORT", () => {
    it.only("should reduce stopLoss position size on takeProfit fill", async () => {
      await commandCreateShortTrade();
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });

      await expectStopLossPositionToBe(0.024);

      await onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await expectStopLossPositionToBe(0.017);

      await onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await expectStopLossPositionToBe(0.01);
    });

    it("should close current trade and its pending orders", async () => {
      await commandCreateShortTrade();
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });

      await onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await expectTradeStatusToBe(TRADE_STATUS_IN_PROGRESS);
      await expectStopLossStatusToBe(ORDER_STATUS_NEW);
      await expectEntryStatusToBe({ price: 35000 }, ORDER_STATUS_NEW);

      await onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await expectTradeStatusToBe(TRADE_STATUS_IN_PROGRESS);
      await expectStopLossStatusToBe(ORDER_STATUS_NEW);
      await expectEntryStatusToBe({ price: 35000 }, ORDER_STATUS_NEW);

      await onTakeProfitFillByTakeProfitOrder({ price: 30000 });
      await expectTradeStatusToBe(TRADE_STATUS_COMPLETED);
      await expectStopLossStatusToBe(ORDER_STATUS_CANCELLED);
      await expectEntryStatusToBe({ price: 35000 }, ORDER_STATUS_CANCELLED);
    });
  });
});

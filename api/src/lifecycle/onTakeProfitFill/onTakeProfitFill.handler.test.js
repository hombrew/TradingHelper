const { db } = require("../../../test.helpers");
const {
  TRADE_STATUS_IN_PROGRESS,
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CREATED,
} = require("../../config/binance.contracts");
const { handler: createTrade } = require("../../commands/create");
const { handler: onEntryFillHandler } = require("../onEntryFill");
const { handler: onTakeProfitFillHandler } = require(".");
const { ExchangeService } = require("../../services");

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

async function expectStopLossPositionToBe(position) {
  const stopLoss = await db.data.findStopLoss();
  expect(stopLoss.position).toBe(position);
}

async function expectStopLossPriceToBe(price) {
  const stopLoss = await db.data.findStopLoss();
  expect(stopLoss.price).toBe(price);
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

describe("onTakeProfitFillHandler", () => {
  let connection;

  beforeAll(async () => {
    connection = await db.connection();
    await connection.connect();
  });

  afterEach(async () => await connection.clearDatabase());
  afterAll(async () => await connection.closeDatabase());

  describe("LONG", () => {
    it("should reduce stopLoss position size and move its price on takeProfit fill", async () => {
      await commandCreateLongTrade();
      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });

      await expectStopLossPositionToBe(0.034);
      await expectStopLossPriceToBe(29000);

      await onTakeProfitFillByTakeProfitOrder({ price: 33000 });
      await expectStopLossPositionToBe(0.024);
      await expectStopLossPriceToBe(29000);

      await onTakeProfitFillByTakeProfitOrder({ price: 34000 });
      await expectStopLossPositionToBe(0.014);
      await expectStopLossPriceToBe(31000);
    });

    it("should close current trade and its pending orders", async () => {
      await commandCreateLongTrade();
      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });

      await onTakeProfitFillByTakeProfitOrder({ price: 33000 });
      await expectTradeStatusToBe(TRADE_STATUS_IN_PROGRESS);
      await expectStopLossStatusToBe(ORDER_STATUS_CREATED);
      await expectEntryStatusToBe({ price: 30000 }, ORDER_STATUS_CREATED);

      await onTakeProfitFillByTakeProfitOrder({ price: 34000 });
      await expectTradeStatusToBe(TRADE_STATUS_IN_PROGRESS);
      await expectStopLossStatusToBe(ORDER_STATUS_CREATED);
      await expectEntryStatusToBe({ price: 30000 }, ORDER_STATUS_CANCELLED); // cancelled by stopLoss movement

      await onTakeProfitFillByTakeProfitOrder({ price: 35000 });
      await expectTradeStatusToBe(TRADE_STATUS_COMPLETED);
      await expectStopLossStatusToBe(ORDER_STATUS_CANCELLED);
    });
  });

  describe("SHORT", () => {
    it("should reduce stopLoss position size and move its price on takeProfit fill", async () => {
      await commandCreateShortTrade();
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });

      await expectStopLossPositionToBe(0.024);
      await expectStopLossPriceToBe(36000);

      await onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await expectStopLossPositionToBe(0.017);
      await expectStopLossPriceToBe(36000);

      await onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await expectStopLossPositionToBe(0.01);
      await expectStopLossPriceToBe(33000);
    });

    it("should move stopLoss price continously", async () => {
      await commandCreateShortTrade({
        takeProfits: [31000, 30750, 30500, 30250, 30000],
      });
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });

      await onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await expectStopLossPriceToBe(36000);

      await onTakeProfitFillByTakeProfitOrder({ price: 30750 });
      await expectStopLossPriceToBe(33000);

      await onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await expectStopLossPriceToBe(31000);

      await onTakeProfitFillByTakeProfitOrder({ price: 30250 });
      await expectStopLossPriceToBe(30750);

      await onTakeProfitFillByTakeProfitOrder({ price: 30000 });
      await expectStopLossPriceToBe(30750);
      await expectStopLossStatusToBe(ORDER_STATUS_CANCELLED);
    });

    it("should close current trade and its pending orders", async () => {
      await commandCreateShortTrade();
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });

      await onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await expectTradeStatusToBe(TRADE_STATUS_IN_PROGRESS);
      await expectStopLossStatusToBe(ORDER_STATUS_CREATED);
      await expectEntryStatusToBe({ price: 35000 }, ORDER_STATUS_CREATED);

      await onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await expectTradeStatusToBe(TRADE_STATUS_IN_PROGRESS);
      await expectStopLossStatusToBe(ORDER_STATUS_CREATED);
      await expectEntryStatusToBe({ price: 35000 }, ORDER_STATUS_CANCELLED); // cancelled by stopLoss movement

      await onTakeProfitFillByTakeProfitOrder({ price: 30000 });
      await expectTradeStatusToBe(TRADE_STATUS_COMPLETED);
      await expectStopLossStatusToBe(ORDER_STATUS_CANCELLED);
    });
  });
});

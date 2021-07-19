const { db } = require("../../../test.helpers");
const { handler: createTrade } = require("../../commands/create");
const {
  ORDER_STATUS_FILLED,
  ORDER_STATUS_CREATED,
} = require("../../config/binance.contracts");
const { handler: onEntryFillHandler } = require(".");
const { ExchangeService } = require("../../services");

jest.mock("../../services/ExchangeService/ExchangeService");
jest.mock("../../services/MessageService/MessageService");

function expectPositionAndOrderIdTypeToBe(order, position, orderIdType) {
  expect(order.position).toBe(position);
  expect(typeof order.orderId).toBe(orderIdType);
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

describe("onEntryFillHandler", () => {
  let connection;

  beforeAll(async () => {
    connection = await db.connection();
    await connection.connect();
  });

  afterEach(async () => await connection.clearDatabase());
  afterAll(async () => await connection.closeDatabase());

  describe("LONG", () => {
    it("should create stopLoss and takeProfit orders", async () => {
      await commandCreateLongTrade();

      let takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0, "undefined");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0, "undefined");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0, "undefined");
      let stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0, "undefined");

      await onEntryFillByEntryOrder({ price: 31000 });
      const entries = await db.data.findEntries();
      expect(entries[0].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[1].status).toBe(ORDER_STATUS_CREATED);
      expect(entries[2].status).toBe(ORDER_STATUS_CREATED);

      takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0.004, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0.004, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0.006, "string");
      stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0.014, "string");
    });

    it("should update stopLoss and takeProfit orders", async () => {
      await commandCreateLongTrade();

      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });
      const entries = await db.data.findEntries();
      expect(entries[0].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[1].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[2].status).toBe(ORDER_STATUS_CREATED);

      const takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0.01, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0.01, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0.014, "string");
      const stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0.034, "string");
    });

    it("should update stopLoss and takeProfit orders", async () => {
      await commandCreateLongTrade();

      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });
      await onEntryFillByEntryOrder({ price: 30000 });
      const entries = await db.data.findEntries();
      expect(entries[0].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[1].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[2].status).toBe(ORDER_STATUS_FILLED);

      const takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0.019, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0.019, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0.025, "string");
      const stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0.063, "string");
    });
  });

  describe("SHORT", () => {
    it("should create stopLoss and takeProfit orders", async () => {
      await commandCreateShortTrade();

      let takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0, "undefined");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0, "undefined");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0, "undefined");
      let stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0, "undefined");

      await onEntryFillByEntryOrder({ price: 33000 });
      const entries = await db.data.findEntries();
      expect(entries[0].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[1].status).toBe(ORDER_STATUS_CREATED);
      expect(entries[2].status).toBe(ORDER_STATUS_CREATED);

      takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0.003, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0.003, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0.004, "string");
      stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0.01, "string");
    });

    it("should update stopLoss and takeProfit orders", async () => {
      await commandCreateShortTrade();

      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });
      const entries = await db.data.findEntries();
      expect(entries[0].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[1].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[2].status).toBe(ORDER_STATUS_CREATED);

      const takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0.007, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0.007, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0.01, "string");
      const stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0.024, "string");
    });

    it("should update stopLoss and takeProfit orders", async () => {
      await commandCreateShortTrade();

      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });
      await onEntryFillByEntryOrder({ price: 35000 });
      const entries = await db.data.findEntries();
      expect(entries[0].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[1].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[2].status).toBe(ORDER_STATUS_FILLED);

      const takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0.016, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0.016, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0.02, "string");
      const stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0.052, "string");
    });
  });
});

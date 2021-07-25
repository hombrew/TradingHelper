const { db, trades } = require("../../../test.helpers");
const {
  ORDER_STATUS_FILLED,
  ORDER_STATUS_CREATED,
} = require("../../config/binance.contracts");

jest.mock("../../services/LogService/LogService");
jest.mock("../../services/ExchangeService/ExchangeService");
jest.mock("../../services/MessageService/MessageService");

function expectPositionAndOrderIdTypeToBe(order, position, orderIdType) {
  expect(order.position).toBe(position);
  expect(typeof order.orderId).toBe(orderIdType);
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
      await trades.commandCreateLongTrade();

      let takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0, "undefined");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0, "undefined");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0, "undefined");
      let stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0, "undefined");

      await trades.onEntryFillByEntryOrder({ price: 31000 });
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
      await trades.commandCreateLongTrade();

      await trades.onEntryFillByEntryOrder({ price: 31000 });
      await trades.onEntryFillByEntryOrder({ price: 30500 });
      const entries = await db.data.findEntries();
      expect(entries[0].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[1].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[2].status).toBe(ORDER_STATUS_CREATED);

      const takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0.011, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0.011, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0.012, "string");
      const stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0.034, "string");
    });

    it("should update stopLoss and takeProfit orders", async () => {
      await trades.commandCreateLongTrade();

      await trades.onEntryFillByEntryOrder({ price: 31000 });
      await trades.onEntryFillByEntryOrder({ price: 30500 });
      await trades.onEntryFillByEntryOrder({ price: 30000 });
      const entries = await db.data.findEntries();
      expect(entries[0].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[1].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[2].status).toBe(ORDER_STATUS_FILLED);

      const takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0.021, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0.021, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0.022, "string");
      const stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0.064, "string");
    });
  });

  describe("SHORT", () => {
    it("should create stopLoss and takeProfit orders", async () => {
      await trades.commandCreateShortTrade();

      let takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0, "undefined");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0, "undefined");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0, "undefined");
      let stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0, "undefined");

      await trades.onEntryFillByEntryOrder({ price: 33000 });
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
      await trades.commandCreateShortTrade();

      await trades.onEntryFillByEntryOrder({ price: 33000 });
      await trades.onEntryFillByEntryOrder({ price: 34000 });
      const entries = await db.data.findEntries();
      expect(entries[0].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[1].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[2].status).toBe(ORDER_STATUS_CREATED);

      const takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0.008, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0.008, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0.008, "string");
      const stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0.024, "string");
    });

    it("should update stopLoss and takeProfit orders", async () => {
      await trades.commandCreateShortTrade();

      await trades.onEntryFillByEntryOrder({ price: 33000 });
      await trades.onEntryFillByEntryOrder({ price: 34000 });
      await trades.onEntryFillByEntryOrder({ price: 35000 });
      const entries = await db.data.findEntries();
      expect(entries[0].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[1].status).toBe(ORDER_STATUS_FILLED);
      expect(entries[2].status).toBe(ORDER_STATUS_FILLED);

      const takeProfits = await db.data.findTakeProfits();
      expectPositionAndOrderIdTypeToBe(takeProfits[0], 0.017, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[1], 0.017, "string");
      expectPositionAndOrderIdTypeToBe(takeProfits[2], 0.018, "string");
      const stopLoss = await db.data.findStopLoss();
      expectPositionAndOrderIdTypeToBe(stopLoss, 0.052, "string");
    });
  });
});

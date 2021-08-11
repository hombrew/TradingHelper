const {
  ORDER_STATUS_CREATED,
  ORDER_STATUS_CANCELLED,
} = require("../../config/binance.contracts");
const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../config/constants");
const { db } = require("../../../test.helpers");
const { ExchangeService } = require("../../services");
const { cancelOrder } = require("../cancelOrder");
const { upsertOrder } = require(".");

jest.mock("../cancelOrder");
jest.mock("../../services/LogService/LogService");
jest.mock("../../services/ExchangeService/ExchangeService");

describe("upsertOrder", () => {
  let connection;

  beforeEach(() => jest.clearAllMocks());
  beforeAll(async () => {
    connection = await db.connection();
    await connection.connect();
  });

  afterEach(async () => await connection.clearDatabase());
  afterAll(async () => await connection.closeDatabase());

  it("should fail to upsert an already filled or cancelled order", async () => {
    const trade = db.data.createTrade();
    const order = db.data.createEntry({ status: ORDER_STATUS_CANCELLED });
    await expect(upsertOrder(trade, order)).rejects.toThrow(
      `Impossible to upsert an order with '${order.status}' order`
    );
  });

  it("should first cancel an order if it already exists", async () => {
    const trade = db.data.createTrade();
    const order = db.data.createEntry({ orderId: 12343 });
    await upsertOrder(trade, order);
    expect(cancelOrder).toHaveBeenCalledTimes(1);
  });

  it("should throw if after created, api does not return an orderId", async () => {
    ExchangeService.upsertOrder.mockImplementationOnce(() => ({}));
    const trade = db.data.createTrade();
    const order = db.data.createEntry();
    await expect(upsertOrder(trade, order)).rejects.toThrow(
      `Impossible to add order ${order.symbol} of price ${order.price}`
    );
  });

  it("should be saved as created in db after a successful exchange creation", async () => {
    const trade = db.data.createTrade();
    const order = db.data.createEntry();
    const saveOrder = await upsertOrder(trade, order);
    expect(cancelOrder).toHaveBeenCalledTimes(0);
    expect(ExchangeService.upsertOrder).toHaveBeenCalledWith(
      TRADE_DIRECTION_LONG,
      expect.objectContaining(order)
    );
    expect(saveOrder.status).toBe(ORDER_STATUS_CREATED);
  });

  it("should run even if only given the trade direction", async () => {
    const order = db.data.createEntry();
    const saveOrder = await upsertOrder(TRADE_DIRECTION_SHORT, order);
    expect(cancelOrder).toHaveBeenCalledTimes(0);
    expect(ExchangeService.upsertOrder).toHaveBeenCalledWith(
      TRADE_DIRECTION_SHORT,
      expect.objectContaining(order)
    );
    expect(saveOrder.status).toBe(ORDER_STATUS_CREATED);
  });
});

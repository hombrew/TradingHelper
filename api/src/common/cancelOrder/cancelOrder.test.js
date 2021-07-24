const {
  ORDER_STATUS_CREATED,
  ORDER_STATUS_NEW,
  ORDER_STATUS_CANCELLED,
} = require("../../config/binance.contracts");
const { db } = require("../../../test.helpers");
const { cancelOrder } = require(".");
const { ExchangeService } = require("../../services");

jest.mock("../../services/LogService/LogService");
jest.mock("../../services/ExchangeService/ExchangeService");

async function generateStopLoss(input = {}) {
  const newOrder = db.data.createStopLossOrder(input);
  await newOrder.save();
  return newOrder;
}

async function expectSLStatusToBe(status) {
  let dbOrder = await db.data.findStopLoss();
  expect(dbOrder.status).toBe(status);
}

describe("cancelOrder", () => {
  let connection;

  beforeEach(() => jest.clearAllMocks());
  beforeAll(async () => {
    connection = await db.connection();
    await connection.connect();
  });

  afterEach(async () => await connection.clearDatabase());
  afterAll(async () => await connection.closeDatabase());

  it("should update in db an order to be cancelled", async () => {
    const newOrder = await generateStopLoss();
    await expectSLStatusToBe(ORDER_STATUS_NEW);
    await cancelOrder(newOrder);
    await expectSLStatusToBe(ORDER_STATUS_CANCELLED);
    expect(ExchangeService.cancelOrder).not.toHaveBeenCalled();
  });

  it("should cancel an order from binance before saving it to the db", async () => {
    const orderId = "superUserId";
    const newOrder = await generateStopLoss({
      status: ORDER_STATUS_CREATED,
      orderId,
    });
    await expectSLStatusToBe(ORDER_STATUS_CREATED);
    await cancelOrder(newOrder);
    await expectSLStatusToBe(ORDER_STATUS_CANCELLED);
    expect(ExchangeService.cancelOrder).toHaveBeenNthCalledWith(
      1,
      newOrder.symbol,
      { orderId }
    );
  });
});

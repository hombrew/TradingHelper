const { db, trades } = require("../../../test.helpers");
const {
  TRADE_STATUS_IN_PROGRESS,
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CREATED,
} = require("../../config/binance.contracts");

jest.mock("../../services/LogService/LogService");
jest.mock("../../services/ExchangeService/ExchangeService");
jest.mock("../../services/MessageService/MessageService");

async function expectTakeProfitsStatusToBe(status) {
  const takeProfits = await db.data.findTakeProfits();
  const check = takeProfits.every((tp) => tp.status === status);
  expect(check).toBe(true);
}

describe("onStopLossFillHandler", () => {
  let connection;

  beforeAll(async () => {
    connection = await db.connection();
    await connection.connect();
  });

  afterEach(async () => await connection.clearDatabase());
  afterAll(async () => await connection.closeDatabase());

  it("should close current trade and its pending orders", async () => {
    await trades.commandCreateLongTrade();
    await trades.onEntryFillByEntryOrder({ price: 31000 });
    await trades.onEntryFillByEntryOrder({ price: 30500 });
    await trades.onEntryFillByEntryOrder({ price: 30000 });

    await trades.expectTradeStatusToBe({}, TRADE_STATUS_IN_PROGRESS);
    await expectTakeProfitsStatusToBe(ORDER_STATUS_CREATED);

    await trades.onStopLossFillByStopLossOrder();

    await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
    await expectTakeProfitsStatusToBe(ORDER_STATUS_CANCELLED);
  });
});

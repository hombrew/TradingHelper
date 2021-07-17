const { db } = require("../../../test.helpers");
const {
  TRADE_STATUS_IN_PROGRESS,
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_NEW,
  ORDER_STATUS_CANCELLED,
} = require("../../config/binance.contracts");
const { handler: createTrade } = require("../../commands/create");
const { handler: onEntryFillHandler } = require("../onEntryFill");
const { handler: onStopLossFillHandler } = require(".");
const { ExchangeService } = require("../../services");

jest.mock("../../services/ExchangeService/ExchangeService");
jest.mock("../../services/MessageService/MessageService");

async function expectTakeProfitsStatusToBe(status) {
  const takeProfits = await db.data.findTakeProfits();
  const check = takeProfits.every((tp) => tp.status === status);
  expect(check).toBe(true);
}

async function expectTradeStatusToBe(status) {
  const trade = await db.data.findTrade();
  expect(trade.status).toBe(status);
}

async function onSLFillBySLOrder(input = {}) {
  const filledOrder = await db.data.findStopLoss(input);
  const filledOrderEvent = db.events.filledOrder(filledOrder.toObject());
  return onStopLossFillHandler(filledOrderEvent);
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

describe("onStopLossFillHandler", () => {
  let connection;

  beforeAll(async () => {
    connection = await db.connection();
    await connection.connect();
  });

  afterEach(async () => await connection.clearDatabase());
  afterAll(async () => await connection.closeDatabase());

  it("should close current trade and its pending orders", async () => {
    await commandCreateLongTrade();
    await onEntryFillByEntryOrder({ price: 31000 });
    await onEntryFillByEntryOrder({ price: 30500 });
    await onEntryFillByEntryOrder({ price: 30000 });

    await expectTradeStatusToBe(TRADE_STATUS_IN_PROGRESS);
    await expectTakeProfitsStatusToBe(ORDER_STATUS_NEW);

    await onSLFillBySLOrder();

    await expectTradeStatusToBe(TRADE_STATUS_COMPLETED);
    await expectTakeProfitsStatusToBe(ORDER_STATUS_CANCELLED);
  });
});

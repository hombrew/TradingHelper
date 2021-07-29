const { db, trades } = require("../../../test.helpers");
const { ExchangeService } = require("../../services");

jest.mock("../../services/LogService/LogService");
jest.mock("../../services/ExchangeService/ExchangeService");
jest.mock("../../services/MessageService/MessageService");
jest.mock(".", () => {
  const original = jest.requireActual(".");
  return {
    ...original,
    fixPositionMargin: jest.fn(original.fixPositionMargin),
  };
});

describe("fixPositionMargin", () => {
  let connection;

  beforeAll(async () => {
    connection = await db.connection();
    await connection.connect();
  });

  afterEach(async () => await connection.clearDatabase());
  afterAll(async () => await connection.closeDatabase());

  it("should do nothing", async () => {
    await trades.commandCreateLongTrade();
    ExchangeService.getOpenPositions.mockResolvedValue([
      { isolatedMargin: "45" },
    ]);
    await trades.onEntryFillByEntryOrder({ price: 31000 });
    expect(ExchangeService.addPositionMargin).not.toHaveBeenCalled();
  });

  it("should call addPosition margin", async () => {
    await trades.commandCreateLongTrade();
    ExchangeService.getOpenPositions.mockResolvedValue([
      { isolatedMargin: "32" },
    ]);
    await trades.onEntryFillByEntryOrder({ price: 31000 });
    expect(ExchangeService.addPositionMargin).toHaveBeenNthCalledWith(
      1,
      "BTCUSDT",
      7.45
    );
  });
});

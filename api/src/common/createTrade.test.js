const { db, trades } = require("../../test.helpers");
const { ExchangeService } = require("../services");

jest.mock("../services/LogService/LogService");
jest.mock("../services/ExchangeService/ExchangeService");
jest.mock("../services/MessageService/MessageService");

describe("onEntryFillHandler", () => {
  let connection;

  beforeAll(async () => {
    connection = await db.connection();
    await connection.connect();
  });

  afterEach(async () => await connection.clearDatabase());
  afterAll(async () => await connection.closeDatabase());

  describe("checkAccountBalance", () => {
    describe("fail", () => {
      ExchangeService.getAccountBalance.mockResolvedValue(100);

      it("should not open a trade because of lack of capital", async () => {
        await expect(trades.commandCreateLongTrade()).rejects.toThrow(
          "Can't trade this because you still need USDT 32.19 more in your account."
        );
      });

      it("should open only if previous entries were filled", async () => {
        await expect(
          trades.commandCreateLongTrade({ risked: 50 })
        ).resolves.toBeTruthy();

        await expect(
          trades.commandCreateLongTrade({ risked: 50 })
        ).rejects.toThrow(
          "Can't trade this because you still need USDT 30.78 more in your account."
        );

        await trades.onEntryFillByEntryOrder({ price: 31000 });
        await trades.onEntryFillByEntryOrder({ price: 30500 });
        await trades.onTakeProfitFillByTakeProfitOrder({ price: 33000 });
        await trades.onTakeProfitFillByTakeProfitOrder({ price: 34000 });

        await expect(
          trades.commandCreateLongTrade({ risked: 50 })
        ).rejects.toThrow(
          "Can't trade this because you still need USDT 8.36 more in your account."
        );

        await expect(
          trades.commandCreateLongTrade({ risked: 20 })
        ).resolves.toBeTruthy();

        await trades.onTakeProfitFillByTakeProfitOrder({ price: 35000 });

        await expect(
          trades.commandCreateLongTrade({ risked: 50 })
        ).resolves.toBeTruthy();

        await expect(
          trades.commandCreateLongTrade({ risked: 30 })
        ).rejects.toThrow(
          "Can't trade this because you still need USDT 28.78 more in your account."
        );
      });
    });
  });
});

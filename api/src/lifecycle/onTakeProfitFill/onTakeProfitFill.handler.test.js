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
      await trades.commandCreateLongTrade();
      await trades.onEntryFillByEntryOrder({ price: 31000 });
      await trades.onEntryFillByEntryOrder({ price: 30500 });

      await trades.expectStopLossPositionToBe({}, 0.034);
      await trades.expectStopLossPriceToBe({}, 29000);

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 33000 });
      await trades.expectStopLossPositionToBe({}, 0.023);
      await trades.expectStopLossPriceToBe({}, 29000);

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 34000 });
      await trades.expectStopLossPositionToBe({}, 0.012);
      await trades.expectStopLossPriceToBe({}, 31000);
    });

    it("should close current trade and its pending orders", async () => {
      await trades.commandCreateLongTrade();
      await trades.onEntryFillByEntryOrder({ price: 31000 });
      await trades.onEntryFillByEntryOrder({ price: 30500 });

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 33000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_IN_PROGRESS);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CREATED);
      await trades.expectEntryStatusToBe(
        { price: 30000 },
        ORDER_STATUS_CREATED
      );

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 34000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_IN_PROGRESS);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CREATED);
      await trades.expectEntryStatusToBe(
        { price: 30000 },
        ORDER_STATUS_CANCELLED
      ); // cancelled by stopLoss movement

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 35000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CANCELLED);
    });
  });

  describe("SHORT", () => {
    it("should reduce stopLoss position size and move its price on takeProfit fill", async () => {
      await trades.commandCreateShortTrade();
      await trades.onEntryFillByEntryOrder({ price: 33000 });
      await trades.onEntryFillByEntryOrder({ price: 34000 });

      await trades.expectStopLossPositionToBe({}, 0.024);
      await trades.expectStopLossPriceToBe({}, 36000);

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await trades.expectStopLossPositionToBe({}, 0.016);
      await trades.expectStopLossPriceToBe({}, 36000);

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await trades.expectStopLossPositionToBe({}, 0.008);
      await trades.expectStopLossPriceToBe({}, 33000);
    });

    it("should move stopLoss price continously", async () => {
      await trades.commandCreateShortTrade({
        takeProfits: [31000, 30750, 30500, 30250, 30000],
      });
      await trades.onEntryFillByEntryOrder({ price: 33000 });
      await trades.onEntryFillByEntryOrder({ price: 34000 });

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await trades.expectStopLossPriceToBe({}, 36000);

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 30750 });
      await trades.expectStopLossPriceToBe({}, 33000);

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await trades.expectStopLossPriceToBe({}, 31000);

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 30250 });
      await trades.expectStopLossPriceToBe({}, 30750);

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 30000 });
      await trades.expectStopLossPriceToBe({}, 30750);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CANCELLED);
    });

    it("should close current trade and its pending orders", async () => {
      await trades.commandCreateShortTrade();
      await trades.onEntryFillByEntryOrder({ price: 33000 });
      await trades.onEntryFillByEntryOrder({ price: 34000 });

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_IN_PROGRESS);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CREATED);
      await trades.expectEntryStatusToBe(
        { price: 35000 },
        ORDER_STATUS_CREATED
      );

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_IN_PROGRESS);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CREATED);
      await trades.expectEntryStatusToBe(
        { price: 35000 },
        ORDER_STATUS_CANCELLED
      ); // cancelled by stopLoss movement

      await trades.onTakeProfitFillByTakeProfitOrder({ price: 30000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CANCELLED);
    });
  });
});

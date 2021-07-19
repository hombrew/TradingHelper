const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../config/constants");
const { db } = require("../../../test.helpers");
const { getOrderDirectionByTrade } = require(".");

describe("getOrderDirectionByTrade", () => {
  describe("LONG", () => {
    it("should detect entries as longs and stopLoses and takeProfits as shorts", () => {
      expect(
        getOrderDirectionByTrade(db.data.createTrade(), db.data.createEntry())
      ).toBe(TRADE_DIRECTION_LONG);
      expect(
        getOrderDirectionByTrade(
          db.data.createTrade(),
          db.data.createTakeProfit()
        )
      ).toBe(TRADE_DIRECTION_SHORT);
      expect(
        getOrderDirectionByTrade(
          db.data.createTrade(),
          db.data.createStopLoss()
        )
      ).toBe(TRADE_DIRECTION_SHORT);
    });
  });

  describe("SHORT", () => {
    it("should detect entries as longs and stopLoses and takeProfits as shorts", () => {
      expect(
        getOrderDirectionByTrade(
          db.data.createTrade({ direction: TRADE_DIRECTION_SHORT }),
          db.data.createEntry()
        )
      ).toBe(TRADE_DIRECTION_SHORT);
      expect(
        getOrderDirectionByTrade(
          db.data.createTrade({ direction: TRADE_DIRECTION_SHORT }),
          db.data.createTakeProfit()
        )
      ).toBe(TRADE_DIRECTION_LONG);
      expect(
        getOrderDirectionByTrade(
          db.data.createTrade({ direction: TRADE_DIRECTION_SHORT }),
          db.data.createStopLoss()
        )
      ).toBe(TRADE_DIRECTION_LONG);
    });
  });
});

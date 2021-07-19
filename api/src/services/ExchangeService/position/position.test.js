const { ORDER_TYPE_LIMIT } = require("../../../config/binance.contracts");
const { TRADE_DIRECTION_LONG } = require("../../../config/constants");
const { closePosition } = require(".");
const { flushPromises } = require("../../../../test.helpers");

const bw = {
  binance: {
    futuresMarketBuy: jest.fn(),
    futuresMarketSell: jest.fn(),
  },
};

describe("closePosition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOrder = {
    symbol: "BTCUSDT",
    leverage: 10,
    position: 1,
    price: 30000,
    type: ORDER_TYPE_LIMIT,
  };

  it("should close the given position", async () => {
    closePosition.call(bw, TRADE_DIRECTION_LONG, mockOrder);
    await flushPromises();
    expect(bw.binance.futuresMarketSell).toHaveBeenNthCalledWith(
      1,
      mockOrder.symbol,
      mockOrder.position,
      { reduceOnly: true }
    );
  });
});

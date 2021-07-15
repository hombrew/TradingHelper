const {
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_STOP_MARKET,
  ORDER_TYPE_TAKE_PROFIT_MARKET,
} = require("../../../config/binance.contracts");
const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../../config/constants");
const { upsertOrder } = require(".");
const { flushPromises } = require("../../../../test.helpers");

const bw = {
  binance: {
    futuresCancel: jest.fn(),
    futuresBuy: jest.fn(),
    futuresMarginType: jest.fn(),
    futuresLeverage: jest.fn(),
    futuresSell: jest.fn(),
  },
};

describe("upsertOrder", () => {
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

  it("should first cancel an order if it already existed", async () => {
    upsertOrder.call(bw, TRADE_DIRECTION_LONG, {
      ...mockOrder,
      orderId: 12346,
    });
    await flushPromises();
    expect(bw.binance.futuresCancel).toHaveBeenCalledTimes(1);
    expect(bw.binance.futuresBuy).toHaveBeenNthCalledWith(
      1,
      mockOrder.symbol,
      mockOrder.position,
      mockOrder.price,
      { type: mockOrder.type }
    );
  });

  it("should configure leverage if it's an entry", async () => {
    upsertOrder.call(bw, TRADE_DIRECTION_SHORT, mockOrder);
    await flushPromises();
    expect(bw.binance.futuresCancel).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresMarginType).toHaveBeenNthCalledWith(
      1,
      mockOrder.symbol,
      "ISOLATED"
    );
    expect(bw.binance.futuresLeverage).toHaveBeenNthCalledWith(
      1,
      mockOrder.symbol,
      mockOrder.leverage
    );
    expect(bw.binance.futuresSell).toHaveBeenNthCalledWith(
      1,
      mockOrder.symbol,
      mockOrder.position,
      mockOrder.price,
      { type: mockOrder.type }
    );
  });

  it("should close position if it's a stop loss", async () => {
    const order = { ...mockOrder, type: ORDER_TYPE_STOP_MARKET };
    upsertOrder.call(bw, TRADE_DIRECTION_LONG, order);
    await flushPromises();
    expect(bw.binance.futuresCancel).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresMarginType).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresLeverage).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresBuy).toHaveBeenNthCalledWith(
      1,
      order.symbol,
      order.position,
      false,
      { type: order.type, closePosition: true, stopPrice: order.price }
    );
  });

  it("should reduce only if it's a take profit", async () => {
    const order = { ...mockOrder, type: ORDER_TYPE_TAKE_PROFIT_MARKET };
    upsertOrder.call(bw, TRADE_DIRECTION_SHORT, order);
    await flushPromises();
    expect(bw.binance.futuresCancel).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresMarginType).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresLeverage).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresSell).toHaveBeenNthCalledWith(
      1,
      order.symbol,
      order.position,
      false,
      { type: order.type, reduceOnly: true, stopPrice: order.price }
    );
  });
});

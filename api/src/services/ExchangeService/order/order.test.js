const {
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_STOP,
  ORDER_TYPE_TAKE_PROFIT,
} = require("../../../config/binance.contracts");
const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../../config/constants");
const { upsertOrder } = require(".");
const { flushPromises } = require("../../../../test.helpers");

const bw = {
  cancelOrder: jest.fn(),
  binance: {
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
    expect(bw.cancelOrder).toHaveBeenCalledTimes(1);
    expect(bw.binance.futuresBuy).toHaveBeenNthCalledWith(
      1,
      mockOrder.symbol,
      mockOrder.position,
      mockOrder.price,
      { type: mockOrder.type, timeInForce: "GTC" }
    );
  });

  it("should configure leverage if it's an entry", async () => {
    upsertOrder.call(bw, TRADE_DIRECTION_SHORT, mockOrder);
    await flushPromises();
    expect(bw.cancelOrder).toHaveBeenCalledTimes(0);
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
      { type: mockOrder.type, timeInForce: "GTC" }
    );
  });

  it("should close position if it's a stop loss", async () => {
    const order = { ...mockOrder, stopPrice: 31000, type: ORDER_TYPE_STOP };
    upsertOrder.call(bw, TRADE_DIRECTION_LONG, order);
    await flushPromises();
    expect(bw.cancelOrder).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresMarginType).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresLeverage).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresBuy).toHaveBeenNthCalledWith(
      1,
      order.symbol,
      order.position,
      order.price,
      {
        type: order.type,
        reduceOnly: true,
        stopPrice: order.stopPrice,
        timeInForce: "GTC",
      }
    );
  });

  it("should reduce only if it's a take profit", async () => {
    const order = {
      ...mockOrder,
      stopPrice: 29000,
      type: ORDER_TYPE_TAKE_PROFIT,
    };
    upsertOrder.call(bw, TRADE_DIRECTION_SHORT, order);
    await flushPromises();
    expect(bw.cancelOrder).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresMarginType).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresLeverage).toHaveBeenCalledTimes(0);
    expect(bw.binance.futuresSell).toHaveBeenNthCalledWith(
      1,
      order.symbol,
      order.position,
      order.price,
      {
        type: order.type,
        reduceOnly: true,
        stopPrice: order.stopPrice,
        timeInForce: "GTC",
      }
    );
  });
});

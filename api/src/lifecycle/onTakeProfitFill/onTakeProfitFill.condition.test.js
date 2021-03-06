const {
  BINANCE_WS_EVENT_TYPE_ORDER_TRADE_UPDATE,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_TAKE_PROFIT_MARKET,
  ORDER_STATUS_CREATED,
  ORDER_STATUS_FILLED,
} = require("../../config/binance.contracts");
const condition = require("./condition");

describe("onTakeProfitFillCondition", () => {
  it.each([
    ["hola"],
    [12345],
    [Symbol],
    [[]],
    [{ greet: "hey" }],
    [{ order: null }],
    [{ order: 1234 }],
    [{ order: "order" }],
    [{ order: {} }],
    [{ order: { orderType: ORDER_TYPE_TAKE_PROFIT_MARKET } }],
    [{ order: { orderStatus: ORDER_STATUS_FILLED } }],
    [
      {
        order: {
          orderType: ORDER_TYPE_TAKE_PROFIT_MARKET,
          orderStatus: ORDER_STATUS_CREATED,
        },
      },
    ],
    [
      {
        order: {
          orderType: ORDER_TYPE_LIMIT,
          orderStatus: ORDER_STATUS_FILLED,
        },
      },
    ],
  ])("should fail validation when given a worng input", (input) => {
    expect(condition(input)).toBe(false);
  });

  it("should pass validation when given the needed condition", () => {
    const input = {
      eventType: BINANCE_WS_EVENT_TYPE_ORDER_TRADE_UPDATE,
      order: {
        orderType: ORDER_TYPE_MARKET,
        originalOrderType: ORDER_TYPE_TAKE_PROFIT_MARKET,
        orderStatus: ORDER_STATUS_FILLED,
      },
    };
    expect(condition(input)).toBe(true);
  });
});

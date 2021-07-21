const {
  BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE,
  BINANCE_WS_EVENT_REASON_TYPE_ORDER,
} = require("../../config/binance.contracts");
const condition = require("./condition");

describe("onPositionUpdateCondition", () => {
  it.each([
    ["hola"],
    [12345],
    [Symbol],
    [[]],
    [{ greet: "hey" }],
    [{ eventType: BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE }],
    [{ updateData: null }],
    [{ eventType: BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE, updateData: null }],
    [{ eventType: BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE, updateData: {} }],
    [
      {
        eventType: BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE,
        updateData: { eventReasonType: 1234 },
      },
    ],
    [
      {
        eventType: BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE,
        updateData: { eventReasonType: BINANCE_WS_EVENT_REASON_TYPE_ORDER },
      },
    ],
    [
      {
        eventType: BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE,
        updateData: { positions: [] },
      },
    ],
    [
      {
        eventType: BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE,
        updateData: { positions: null },
      },
    ],
    [
      {
        eventType: BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE,
        updateData: { eventReasonType: 1234 },
      },
    ],
    [
      {
        eventType: BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE,
        updateData: { positions: [{ symbol: "KAVAUSDT" }] },
      },
    ],
  ])("should fail validation when given a worng input", (input) => {
    expect(condition(input)).toBe(false);
  });

  it("should pass validation when given the needed condition", () => {
    const input = {
      eventType: BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE,
      updateData: {
        eventReasonType: BINANCE_WS_EVENT_REASON_TYPE_ORDER,
        positions: [{ symbol: "KAVAUSDT" }],
      },
    };
    expect(condition(input)).toBe(true);
  });
});

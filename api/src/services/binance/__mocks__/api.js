const binance = {
  futuresCancel: jest.fn(),
  futuresMarginType: jest.fn(),
  futuresLeverage: jest.fn(),
  futuresBuy: jest
    .fn()
    .mockImplementation(
      (
        symbol,
        position,
        price,
        { type, reduceOnly = false, closePosition = false, stopPrice = "0" }
      ) => ({
        orderId: 25348696045,
        symbol: symbol,
        status: "NEW",
        clientOrderId: "e4xMnzuN3DvlkOMuSYPq7G",
        price: String(price),
        avgPrice: "0.00000",
        origQty: String(position),
        executedQty: "0",
        cumQty: "0",
        cumQuote: "0",
        timeInForce: "GTX",
        type,
        reduceOnly,
        closePosition,
        side: "BUY",
        positionSide: "BOTH",
        stopPrice,
        workingType: "CONTRACT_PRICE",
        priceProtect: false,
        origType: "LIMIT",
        updateTime: 1625797088496,
      })
    ),
  futuresSell: jest
    .fn()
    .mockImplementation(
      (
        symbol,
        position,
        price,
        { type, reduceOnly = false, closePosition = false, stopPrice = "0" }
      ) => ({
        orderId: 25348696045,
        symbol: symbol,
        status: "NEW",
        clientOrderId: "e4xMnzuN3DvlkOMuSYPq7G",
        price: String(price),
        avgPrice: "0.00000",
        origQty: String(position),
        executedQty: "0",
        cumQty: "0",
        cumQuote: "0",
        timeInForce: "GTX",
        type,
        reduceOnly,
        closePosition,
        side: "SELL",
        positionSide: "BOTH",
        stopPrice,
        workingType: "CONTRACT_PRICE",
        priceProtect: false,
        origType: "LIMIT",
        updateTime: 1625797088496,
      })
    ),
};

module.exports.binance = binance;

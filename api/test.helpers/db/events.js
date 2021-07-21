const { ORDER_STATUS_FILLED } = require("../../src/config/binance.contracts");

const transformationMap = {
  type: "originalOrderType",
  price: "stopPrice",
  position: "originalQuantity",
  reduceOnly: "isReduceOnly",
};

function transformInput(input) {
  return Object.keys(input).reduce((result, key) => {
    const newKey = transformationMap[key] || key;
    result[newKey] =
      typeof input[key] === "boolean" ? input[key] : String(input[key]);
    return result;
  }, {});
}

function filledOrder(input = {}) {
  return {
    eventType: "ORDER_TRADE_UPDATE",
    eventTime: 1625684193471,
    transaction: 1625684193467,
    order: {
      symbol: "BTCUSDT",
      clientOrderId: "ios_st_W5uEiT7WAIh2SkS",
      side: "BUY",
      orderType: "LIMIT",
      timeInForce: "GTC",
      originalQuantity: "0.002",
      originalPrice: String(input.price),
      averagePrice: "0",
      stopPrice: "0",
      executionType: "NEW",
      orderStatus: ORDER_STATUS_FILLED,
      orderId: 25232633597,
      orderLastFilledQuantity: "0",
      orderFilledAccumulatedQuantity: "0",
      lastFilledPrice: "0",
      commissionAsset: undefined,
      commission: undefined,
      orderTradeTime: 1625684193467,
      tradeId: 0,
      bidsNotional: "66",
      askNotional: "0",
      isMakerSide: false,
      isReduceOnly: false,
      stopPriceWorkingType: "CONTRACT_PRICE",
      originalOrderType: "LIMIT",
      positionSide: "BOTH",
      closeAll: false,
      activationPrice: undefined,
      callbackRate: undefined,
      realizedProfit: "0",
      ...transformInput(input),
    },
  };
}

function updatedPosition(order, position) {
  return {
    eventType: "ACCOUNT_UPDATE",
    updateData: {
      balances: [
        {
          asset: "USDT",
          crossWalletBalance: "211.61595224",
          walletBalance: "211.61595224",
        },
      ],
      eventReasonType: "ORDER",
      positions: [
        {
          accumulatedRealized: "1.27425999",
          entryPrice: "0.00000",
          isolatedWallet: "0",
          marginType: "isolated",
          positionAmount: String(position),
          positionSide: "BOTH",
          symbol: order.symbol,
          unrealizedPnL: "0",
        },
      ],
    },
  };
}

module.exports.filledOrder = filledOrder;
module.exports.updatedPosition = updatedPosition;

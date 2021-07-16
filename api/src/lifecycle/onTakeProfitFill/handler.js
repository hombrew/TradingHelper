const mongoose = require("mongoose");
const { ExchangeService } = require("../../services");
const { fixedParseFloat } = require("../../utils");
const {
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_NEW,
  ORDER_STATUS_CANCELLED,
  ORDER_TYPE_STOP_MARKET,
} = require("../../config/binance.contracts");

const { TRADE_DIRECTION_LONG } = require("../../config/constants");

async function onLastTakeProfitFillHandler(tradeId) {
  await mongoose
    .model("Trade")
    .findOneAndUpdate({ _id: tradeId }, { status: TRADE_STATUS_COMPLETED })
    .exec();

  const nonFilledOrders = await mongoose
    .model("Order")
    .find({
      trade: tradeId,
      status: ORDER_STATUS_NEW,
    })
    .exec();

  for (const order of nonFilledOrders) {
    const { orderId, symbol } = order;
    if (orderId) {
      await ExchangeService.cancelOrder(symbol, { orderId });
    }

    order.status = ORDER_STATUS_CANCELLED;
    await order.save();
  }
}

async function onOtherTakeProfitFillHandler(takeProfit) {
  const stopLoss = await mongoose
    .model("Order")
    .findOne({ trade: takeProfit.trade._id, type: ORDER_TYPE_STOP_MARKET })
    .exec();

  stopLoss.position = fixedParseFloat(stopLoss.position - takeProfit.position);
  const { orderId } = await ExchangeService.upsertOrder(stopLoss.toObject());
  stopLoss.orderId = orderId;
  await stopLoss.save();
}

async function onTakeProfitFillHandler(event) {
  const takeProfitObj = event.order;

  const takeProfit = await mongoose
    .model("Order")
    .findOneAndUpdate(
      {
        symbol: takeProfitObj.symbol,
        type: takeProfitObj.orderType,
        price: takeProfitObj.originalPrice,
        position: takeProfitObj.originalQuantity,
        status: ORDER_STATUS_NEW,
      },
      { status: takeProfitObj.orderStatus },
      { new: true }
    )
    .exec();

  if (!takeProfit) {
    return;
  }

  let trade = await mongoose
    .model("Trade")
    .findById(takeProfit.trade._id)
    .populate("takeProfits")
    .exec();

  const takeProfitPrices = trade.takeProfits.map((tp) => tp.price);
  const minmax = trade.direction === TRADE_DIRECTION_LONG ? "max" : "min";
  const isLastTrade = Math[minmax](...takeProfitPrices) === takeProfit.price;

  if (isLastTrade) {
    await onLastTakeProfitFillHandler(trade._id);
  } else {
    await onOtherTakeProfitFillHandler(takeProfit);
  }

  trade = await mongoose
    .model("Trade")
    .findById(trade._id)
    .populate("entries")
    .populate("takeProfits")
    .populate("stopLoss")
    .exec();

  return trade.toObject();
}

module.exports = onTakeProfitFillHandler;

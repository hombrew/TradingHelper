const { addBy } = require("../../utils");
const { ORDER_STATUS_FILLED } = require("../../config/binance.contracts");
const { TRADE_DIRECTION_LONG } = require("../../config/constants");

function translate(trade) {
  const { symbol, direction, risked, stopLoss, entries, _id } = trade;

  let text = "";

  const currentlyRisked = addBy(entries, (entry) =>
    entry.status === ORDER_STATUS_FILLED ? entry.risked : 0
  );

  const getTradeDirection = (trade) =>
    trade.direction === TRADE_DIRECTION_LONG ? "🐂" : "🧸";

  const getStatus = (trade) => trade.status.split("_").join(" ");

  text += `*----${symbol}----*\n`;

  if (_id) {
    text += `🧐 ID: /${_id}\n`;
    text += `🤒 Status: ${getStatus(trade)}\n`;
  }

  text += `${getTradeDirection(trade)} Direction: ${direction}\n`;
  text += `🚀 Max risk: ${risked}\n`;
  text += `🏛️ Currently risked: ${currentlyRisked}\n`;
  text += `💣 Stop Loss: ${stopLoss.price}\n`;

  return text;
}

function encodeCalculateData(trades) {
  if (!Array.isArray(trades)) {
    trades = [trades];
  }

  if (trades.length === 0 || !trades[0]) {
    throw new Error("No trades were found");
  }

  return trades.map(translate).join("\n");
}

module.exports = encodeCalculateData;

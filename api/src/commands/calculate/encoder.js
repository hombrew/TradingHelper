const { addBy } = require("../../utils");
const { ORDER_STATUS_FILLED } = require("../../config/binance.contracts");
const { TRADE_DIRECTION_LONG } = require("../../config/constants");

function translate(trade) {
  const { symbol, direction, risked, stopLoss, entries, takeProfits } = trade;
  let text = "";

  const currentlyRisked = addBy(entries, (entry) =>
    entry.status === ORDER_STATUS_FILLED ? entry.risked : 0
  );

  const getTradeDirection = (trade) =>
    trade.direction === TRADE_DIRECTION_LONG ? "🐂" : "🧸";

  text += `*----${symbol}----*\n`;
  text += `${getTradeDirection(trade)} ${direction}\n`;
  text += `🚀 Max risk: ${risked}\n`;
  text += `🏛️ Currently risked: ${currentlyRisked}\n`;
  text += `💣 Stop Loss: ${stopLoss.price}\n`;
  text += `📝 Entries:\n\n`;

  const getFilledStatus = (order) =>
    order.status === ORDER_STATUS_FILLED ? "✅" : "⭕";

  entries.forEach((order) => {
    text += `     price: ${order.price}\n`;
    text += `     position: ${order.position}\n`;
    text += `     risk: ${order.risked}\n`;
    text += `     filled: ${getFilledStatus(order)}\n\n`;
  });

  text += `🧲 Take Profits:\n\n`;

  takeProfits.forEach((order) => {
    text += `     price: ${order.price}\n`;
    text += `     position: ${order.position}\n`;
    text += `     filled: ${getFilledStatus(order)}\n\n`;
  });

  return text;
}

function encodeCalculateData(trades) {
  if (!Array.isArray(trades)) {
    trades = [trades];
  }

  return trades.map(translate).join("\n\n");
}

module.exports = encodeCalculateData;

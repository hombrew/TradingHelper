const { ORDER_STATUS_FILLED } = require("../../config/binance.contracts");
const tradeDataEncoder = require("../getAll").encoder;

function translate(trade) {
  const { entries, takeProfits } = trade;

  let text = tradeDataEncoder(trade);

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

  if (trades.length === 0 || !trades[0]) {
    throw new Error("No trades were found");
  }

  return trades.map(translate).join("\n\n");
}

module.exports = encodeCalculateData;

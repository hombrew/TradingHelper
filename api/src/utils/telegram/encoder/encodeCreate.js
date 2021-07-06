const groupBy = require("lodash.groupby");
const { addBy } = require("../../common");
const { title } = require("./common");

function translate(data) {
  let text = "";

  Object.entries(data).forEach(([symbol, symbolData]) => {
    text += `${title(symbol, true)}\n`;

    Object.entries(symbolData).forEach(([direction, directionData]) => {
      text += `${title(direction, false)}\n`;
      text += `🚀 Total risked: ${addBy(
        directionData,
        (item) => item.risked
      )}\n`;
      text += `🏛️ Total margin: ${addBy(
        directionData,
        (item) => item.margin
      )}\n`;
      text += `💣 Stop Loss: ${directionData[0].stopLoss}\n`;
      text += `🧲 Take Profits: ${directionData[0].takeProfits.join(" ")}\n`;
      text += `📝 Orders:\n\n`;

      directionData.forEach((order) => {
        text += `     price: ${order.price}\n`;
        text += `     position: ${order.position}\n`;
        text += `     leverage: ${order.leverage}\n`;
        text += `     risked: ${order.risked}\n`;
        text += `     liquidation: ${order.liquidation}\n\n`;
      });
    });
  });

  return text;
}

function encodeCreateMessage(data) {
  const orderedBySymbol = groupBy(data, "symbol");

  Object.keys(orderedBySymbol).forEach((symbol) => {
    orderedBySymbol[symbol] = groupBy(orderedBySymbol[symbol], "direction");
  });

  return translate(orderedBySymbol);
}

module.exports.encodeCreateMessage = encodeCreateMessage;

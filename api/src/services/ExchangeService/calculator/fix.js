const { truncate, addBy } = require("../../../utils");

function checkTradeEntries(minimum, entries, takeProfitsLength) {
  const { minQty, maxQty, stepSize } = minimum;

  return entries.map((order) => {
    if (order.position < minQty) {
      throw new Error(
        `Position size of '${order.position}' per entry is less than the minimum quantity allowed of ${minQty} per trade`
      );
    }

    if (order.position > maxQty) {
      throw new Error(
        `Position size of '${order.position}' per entry exceeds the maximum quantity allowed of ${maxQty} per trade`
      );
    }

    if (truncate(order.position / takeProfitsLength, stepSize) < minQty) {
      throw new Error(
        `The current position per entry (${order.position}) cannot be divided between that amount of take profits. Try lowering the amount of take profits or incrementing the amount of risked money.`
      );
    }

    return order;
  });
}

function fixPrice(minimum, order) {
  const { tickSize } = minimum;
  return {
    ...order,
    price: truncate(order.price, tickSize),
  };
}

async function checkTrade(trade, minimum) {
  const takeProfits = trade.takeProfits.map(fixPrice.bind(null, minimum));
  const entries = checkTradeEntries(minimum, trade.entries, takeProfits.length);
  return {
    ...trade,
    risked: truncate(
      addBy(entries, ({ risked }) => risked),
      minimum.tickSize
    ),
    entries,
    takeProfits,
    stopLoss: fixPrice(minimum, trade.stopLoss),
  };
}

module.exports.checkTrade = checkTrade;

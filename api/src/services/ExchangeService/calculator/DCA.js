const { TRADE_DIRECTION_LONG } = require("../../../config/constants");
const { range, truncate, fixedParseFloat } = require("../../../utils");

function generateSteps(total, length, size) {
  const amountPerItem = truncate(total / length, size);
  return range(length).map((_, index) => {
    return index === length - 1
      ? fixedParseFloat(total - amountPerItem * (length - 1))
      : amountPerItem;
  });
}

function generateDCA(trade) {
  const { entries, parts, direction, risked: totalRisked } = trade;

  if (entries.length === 1) {
    return {
      ...trade,
      entries: [{ ...trade.entries[0], risked: totalRisked }],
    };
  }

  const risks = generateSteps(totalRisked, parts, "0.01");

  if (direction === TRADE_DIRECTION_LONG) {
    const step = (entries[0].price - entries[1].price) / (parts - 1);

    const entryOrders = range(parts - 1).map((_, index) => {
      const price = fixedParseFloat(entries[0].price - step * (index + 1));
      const risked = risks[index + 1];
      return { ...entries[0], price, risked };
    });

    return {
      ...trade,
      entries: [{ ...entries[0], risked: risks[0] }, ...entryOrders],
    };
  }

  const step = (entries[1].price - entries[0].price) / (parts - 1);

  const entryOrders = range(parts - 1).map((_, index) => {
    const price = fixedParseFloat(entries[0].price + step * (index + 1));
    const risked = risks[index + 1];
    return { ...entries[0], price, risked };
  });

  return {
    ...trade,
    entries: [{ ...entries[0], risked: risks[0] }, ...entryOrders],
  };
}

module.exports.generateDCA = generateDCA;

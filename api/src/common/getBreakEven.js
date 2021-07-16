const { TRADE_DIRECTION_LONG } = require("../config/constants");

function getBreakEven(trade) {
  const entries = [...trade.entries];
  entries.sort((entryA, entryB) => entryA.price - entryB.price);
  const beIndex =
    trade.direction === TRADE_DIRECTION_LONG ? entries.length - 1 : 0;
  return entries[beIndex];
}

module.exports.getBreakEven = getBreakEven;

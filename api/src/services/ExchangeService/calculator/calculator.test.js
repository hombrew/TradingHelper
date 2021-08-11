const faker = require("faker");
const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../../config/constants");
const { range, uniqBy } = require("../../../utils");
const { calculateTradeValues } = require(".");
const { ExchangeService } = require("../ExchangeService");

jest.mock("../ExchangeService");

function createTrade(direction, symbol, parts = 1, risked, sl, entries) {
  const takeProfits = range(faker.datatype.number({ min: 1, max: 4 })).map(
    () => {
      const min = Math.max(...entries) * 1.5;
      const price = faker.datatype.number({ min, max: min * 3 });
      return { symbol, price };
    }
  );
  return {
    symbol: symbol,
    direction: direction,
    parts,
    risked,
    stopLoss: {
      price: sl,
    },
    takeProfits: uniqBy(takeProfits, (order) => order.price),
    entries: entries.map((price) => ({ symbol, price })),
  };
}

const createLong = createTrade.bind(null, TRADE_DIRECTION_LONG);
const createShort = createTrade.bind(null, TRADE_DIRECTION_SHORT);

describe("calculator", () => {
  it.each([
    [createLong("ZENUSDT", 3, 58, 44, [47.7, 46]), 26.59, 27.07, 28.48],
    [
      createLong("ALICEUSDT", 4, 128.62, 4.798, [5.505, 5.106]),
      42.72,
      43.29,
      44.11,
      45.63,
    ],
    [createLong("1INCHUSDT", 4, 4, 1.8, [1.96, 1.92]), 1.32, 1.22, 1.3, 1.36],
    [createShort("ENJUSDT", 3, 25, 1.4, [1.3, 1.35]), 11.69, 12.11, 12.85],
    [createShort("BATUSDT", 1, 237, 0.6073, [0.555]), 328.15],
    [createLong("ONTUSDT", 3, 58, 0.69, [0.693]), 669.9],
  ])("should return the correct value", async (trade, ...balances) => {
    const calculatedTrade = await calculateTradeValues.call(
      ExchangeService,
      trade
    );
    balances.forEach((balance, index) => {
      expect(calculatedTrade.entries[index].balance).toBe(balance);
    });
  });
});

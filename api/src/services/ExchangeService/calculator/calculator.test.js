const faker = require("faker");
const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../../config/constants");
const { range } = require("../../../utils");
const { calculateTradeValues } = require(".");
const { ExchangeService } = require("../ExchangeService");

jest.mock("../ExchangeService");

function createTrade(direction, symbol, parts = 1, risked, sl, entries) {
  const takeProfits = range(faker.datatype.number({ min: 1, max: 4 }));
  return {
    symbol: symbol,
    direction: direction,
    parts,
    risked,
    stopLoss: {
      price: sl,
    },
    takeProfits: takeProfits.map(() => {
      const min = Math.max(...entries) * 1.5;
      const price = faker.datatype.number({ min, max: min * 3 });
      return { symbol, price };
    }),
    entries: entries.map((price) => ({ symbol, price })),
  };
}

const createLong = createTrade.bind(null, TRADE_DIRECTION_LONG);
const createShort = createTrade.bind(null, TRADE_DIRECTION_SHORT);

describe("calculator", () => {
  it.each([
    [createLong("ZENUSDT", 3, 7, 44, [47.7, 46]), 42.24, 43.08, 43.14],
    [
      createLong("ALICEUSDT", 4, 128.62, 4.798, [5.505, 5.106]),
      4.45,
      4.52,
      4.63,
      4.69,
    ],
    [createShort("ENJUSDT", 3, 25, 1.4, [1.3, 1.35]), 1.43, 1.42, 1.42],
    [createShort("BATUSDT", 1, 237, 0.6073, [0.555]), 1.43, 1.42, 1.42],
  ])("should return the correct value", async (trade, ...liquidations) => {
    const calculatedTrade = await calculateTradeValues.call(
      ExchangeService,
      trade
    );

    liquidations.forEach((liquidation, index) => {
      expect(calculatedTrade.entries[index].liquidation).toBe(liquidation);
    });
  });
});

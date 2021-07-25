const { db, trades } = require("../../../test.helpers");
const {
  TRADE_STATUS_IN_PROGRESS,
  TRADE_STATUS_COMPLETED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CREATED,
  ORDER_TYPE_LIMIT,
  ORDER_STATUS_FILLED,
} = require("../../config/binance.contracts");
const { TRADE_DIRECTION_LONG } = require("../../config/constants");
const { handler: onEntryFillHandler } = require("../onEntryFill");
const { handler: onPositionUpdateHandler } = require(".");
const { ExchangeService } = require("../../services");
const { fixedParseFloat } = require("../../utils");

jest.mock("../../services/LogService/LogService");
jest.mock("../../services/ExchangeService/ExchangeService");
jest.mock("../../services/MessageService/MessageService");

let position = 0;

async function addOrderPosition(order) {
  const trade = await db.data.findTrade({ _id: order.trade._id });
  if (trade.direction === TRADE_DIRECTION_LONG) {
    order.type === ORDER_TYPE_LIMIT
      ? (position = fixedParseFloat(position + order.position))
      : (position = fixedParseFloat(position - order.position));
  } else {
    order.type === ORDER_TYPE_LIMIT
      ? (position = fixedParseFloat(position - order.position))
      : (position = fixedParseFloat(position + order.position));
  }
}

async function onTakeProfitFillByTakeProfitOrder(input = {}) {
  const filledOrders = await db.data.findTakeProfits(input);
  await addOrderPosition(filledOrders[0]);
  const filledOrderEvent = db.events.updatedPosition(
    filledOrders[0].toObject(),
    position
  );
  return onPositionUpdateHandler(filledOrderEvent);
}

async function onStopLossFillByStopLossOrder(input = {}) {
  const stopLoss = await db.data.findStopLoss(input);
  await addOrderPosition(stopLoss);
  const filledStopLoss = db.events.updatedPosition(
    stopLoss.toObject(),
    position
  );
  return onPositionUpdateHandler(filledStopLoss);
}

async function onEntryFillByEntryOrder(input = {}) {
  const filledOrders = await db.data.findEntries(input);
  await addOrderPosition(filledOrders[0]);
  const filledOrderEvent = db.events.filledOrder(filledOrders[0].toObject());
  return onEntryFillHandler(filledOrderEvent);
}

describe("onPositionUpdateHandler", () => {
  let connection;

  beforeEach(() => {
    position = 0;
  });
  beforeAll(async () => {
    connection = await db.connection();
    await connection.connect();
  });

  afterEach(async () => await connection.clearDatabase());
  afterAll(async () => await connection.closeDatabase());

  describe("LONG", () => {
    it("should reduce stopLoss position size and move its price on takeProfit fill", async () => {
      await trades.commandCreateLongTrade();
      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });

      await trades.expectStopLossPositionToBe({}, 0.034);
      await trades.expectStopLossPriceToBe({}, 29000);

      await onTakeProfitFillByTakeProfitOrder({ price: 33000 });
      await trades.expectStopLossPositionToBe({}, 0.023);
      await trades.expectStopLossPriceToBe({}, 29000);
      await trades.expectTakeProfitStatusToBe(
        { price: 33000 },
        ORDER_STATUS_FILLED
      );

      await onTakeProfitFillByTakeProfitOrder({ price: 34000 });
      await trades.expectStopLossPositionToBe({}, 0.012);
      await trades.expectStopLossPriceToBe({}, 31000);
      await trades.expectTakeProfitStatusToBe(
        { price: 34000 },
        ORDER_STATUS_FILLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 35000 },
        ORDER_STATUS_CREATED
      );
    });

    it("should close current trade and its pending orders when reaching last take profit", async () => {
      await trades.commandCreateLongTrade();
      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });

      await onTakeProfitFillByTakeProfitOrder({ price: 33000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_IN_PROGRESS);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CREATED);
      await trades.expectEntryStatusToBe(
        { price: 30000 },
        ORDER_STATUS_CREATED
      );

      await onTakeProfitFillByTakeProfitOrder({ price: 34000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_IN_PROGRESS);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CREATED);
      await trades.expectStopLossPriceToBe({}, 31000);
      await trades.expectEntryStatusToBe(
        { price: 30000 },
        ORDER_STATUS_CANCELLED
      ); // cancelled by stopLoss movement

      ExchangeService.getPrice.mockImplementationOnce(() => 35100);
      await onTakeProfitFillByTakeProfitOrder({ price: 35000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CANCELLED);
    });

    it("should close current trade and its pending orders when reaching stop loss", async () => {
      await trades.commandCreateLongTrade();
      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });
      await onEntryFillByEntryOrder({ price: 30000 });

      await onStopLossFillByStopLossOrder({ price: 29000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
      await trades.expectTakeProfitStatusToBe(
        { price: 33000 },
        ORDER_STATUS_CANCELLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 34000 },
        ORDER_STATUS_CANCELLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 35000 },
        ORDER_STATUS_CANCELLED
      );
    });

    it("should stop out in profit", async () => {
      await trades.commandCreateLongTrade();
      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });
      await onTakeProfitFillByTakeProfitOrder({ price: 33000 });
      await onTakeProfitFillByTakeProfitOrder({ price: 34000 });
      ExchangeService.getPrice.mockImplementationOnce(() => 31100);
      await onStopLossFillByStopLossOrder({ price: 31000 });

      await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
      await trades.expectEntryStatusToBe(
        { price: 30000 },
        ORDER_STATUS_CANCELLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 33000 },
        ORDER_STATUS_FILLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 34000 },
        ORDER_STATUS_FILLED
      );
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_FILLED);
      await trades.expectTakeProfitStatusToBe(
        { price: 35000 },
        ORDER_STATUS_CANCELLED
      );
    });

    it("should stop out", async () => {
      await trades.commandCreateLongTrade();
      await onEntryFillByEntryOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 30500 });
      await onTakeProfitFillByTakeProfitOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 30000 });
      ExchangeService.getPrice.mockImplementationOnce(() => 28000);
      await onStopLossFillByStopLossOrder({ price: 29000 });

      await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
      await trades.expectEntryStatusToBe({ price: 30000 }, ORDER_STATUS_FILLED);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_FILLED);
      await trades.expectTakeProfitStatusToBe(
        { price: 33000 },
        ORDER_STATUS_FILLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 34000 },
        ORDER_STATUS_CANCELLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 35000 },
        ORDER_STATUS_CANCELLED
      );
    });
  });

  describe("SHORT", () => {
    it("should reduce stopLoss position size and move its price on takeProfit fill", async () => {
      await trades.commandCreateShortTrade();
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });

      await trades.expectStopLossPositionToBe({}, 0.024);
      await trades.expectStopLossPriceToBe({}, 36000);

      await onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await trades.expectStopLossPositionToBe({}, 0.016);
      await trades.expectStopLossPriceToBe({}, 36000);

      await onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await trades.expectStopLossPositionToBe({}, 0.008);
      await trades.expectStopLossPriceToBe({}, 33000);
    });

    it("should move stopLoss price continously", async () => {
      await trades.commandCreateShortTrade({
        takeProfits: [31000, 30750, 30500, 30250, 30000],
      });
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });

      await onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await trades.expectStopLossPriceToBe({}, 36000);

      await onTakeProfitFillByTakeProfitOrder({ price: 30750 });
      await trades.expectStopLossPriceToBe({}, 33000);

      await onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await trades.expectStopLossPriceToBe({}, 31000);

      await onTakeProfitFillByTakeProfitOrder({ price: 30250 });
      await trades.expectStopLossPriceToBe({}, 30750);

      await onTakeProfitFillByTakeProfitOrder({ price: 30000 });
      await trades.expectStopLossPriceToBe({}, 30750);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CANCELLED);
    });

    it("should close current trade and its pending orders when reaching last take profit", async () => {
      await trades.commandCreateShortTrade();
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });

      await onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_IN_PROGRESS);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CREATED);
      await trades.expectEntryStatusToBe(
        { price: 35000 },
        ORDER_STATUS_CREATED
      );

      await onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_IN_PROGRESS);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CREATED);
      await trades.expectEntryStatusToBe(
        { price: 35000 },
        ORDER_STATUS_CANCELLED
      ); // cancelled by stopLoss movement

      ExchangeService.getPrice.mockImplementationOnce(() => 31000);
      await onTakeProfitFillByTakeProfitOrder({ price: 30000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_CANCELLED);
    });

    it("should close current trade and its pending orders when reaching stop loss", async () => {
      await trades.commandCreateShortTrade();
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });
      await onEntryFillByEntryOrder({ price: 35000 });

      await onStopLossFillByStopLossOrder({ price: 36000 });
      await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
      await trades.expectTakeProfitStatusToBe(
        { price: 31000 },
        ORDER_STATUS_CANCELLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 30500 },
        ORDER_STATUS_CANCELLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 30000 },
        ORDER_STATUS_CANCELLED
      );
    });

    it("should stop out in profit", async () => {
      await trades.commandCreateShortTrade();
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });
      await onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await onTakeProfitFillByTakeProfitOrder({ price: 30500 });
      ExchangeService.getPrice.mockImplementationOnce(() => 32500);
      await onStopLossFillByStopLossOrder({ price: 33000 });

      await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
      await trades.expectEntryStatusToBe(
        { price: 35000 },
        ORDER_STATUS_CANCELLED
      );
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_FILLED);
      await trades.expectTakeProfitStatusToBe(
        { price: 31000 },
        ORDER_STATUS_FILLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 30500 },
        ORDER_STATUS_FILLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 30000 },
        ORDER_STATUS_CANCELLED
      );
    });

    it("should stop out", async () => {
      await trades.commandCreateShortTrade();
      await onEntryFillByEntryOrder({ price: 33000 });
      await onEntryFillByEntryOrder({ price: 34000 });
      await onTakeProfitFillByTakeProfitOrder({ price: 31000 });
      await onEntryFillByEntryOrder({ price: 35000 });
      ExchangeService.getPrice.mockImplementationOnce(() => 36000);
      await onStopLossFillByStopLossOrder({ price: 36000 });

      await trades.expectTradeStatusToBe({}, TRADE_STATUS_COMPLETED);
      await trades.expectEntryStatusToBe({ price: 35000 }, ORDER_STATUS_FILLED);
      await trades.expectStopLossStatusToBe({}, ORDER_STATUS_FILLED);
      await trades.expectTakeProfitStatusToBe(
        { price: 31000 },
        ORDER_STATUS_FILLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 30500 },
        ORDER_STATUS_CANCELLED
      );
      await trades.expectTakeProfitStatusToBe(
        { price: 30000 },
        ORDER_STATUS_CANCELLED
      );
    });
  });
});

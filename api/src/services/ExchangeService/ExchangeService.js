const Binance = require("node-binance-api");
const {
  BINANCE_API_KEY,
  BINANCE_API_SECRET_KEY,
} = require("../../config/constants");
const {
  ORDER_STATUS_CREATED,
  ORDER_STATUS_CANCELLED,
} = require("../../config/binance.contracts");
const { sleep, fixedParseFloat } = require("../../utils");
const { upsertOrder } = require("./order");
const { fixTradeConfig, getEntryOrderConfiguration } = require("./calculator");
const { getMinimum } = require("./minimum");
const { closePosition } = require("./position");
const { LogService } = require("../LogService");

const noop = () => {};
const orderFinder = (status, order) => (currentOrder) => {
  return (
    currentOrder.symbol === order.symbol &&
    currentOrder.type === order.type &&
    fixedParseFloat(currentOrder.price) === order.price &&
    fixedParseFloat(currentOrder.position) === order.position &&
    currentOrder.status === status
  );
};

const createdOrderFinder = orderFinder.bind(null, ORDER_STATUS_CREATED);
const cancelledOrderFinder = orderFinder.bind(null, ORDER_STATUS_CANCELLED);

class ExchangeService {
  onOrderUpdateCallback = noop;
  CREATED = [];
  CANCELLED = [];

  constructor(apiKey, secretKey) {
    this.binance = new Binance().options({
      APIKEY: apiKey,
      APISECRET: secretKey,
      useServerTime: true,
    });

    this.initiateSuscriptions();
  }

  onOrderUpdate(callback) {
    this.onOrderUpdateCallback = callback;
  }

  initiateSuscriptions() {
    this.binance.websockets.userFutureData(
      (...event) => LogService.info("MARGIN CALL EVENT", ...event), // margin_call_callback
      (...event) => LogService.info("ACCOUNT UPDATE EVENT", ...event), // account_update_callback
      (...event) => this.onOrderUpdateCallback(...event), // order_update_callback
      (...event) => LogService.info("SUBSCRIBED EVENT", ...event), // subscribed_callback
      (...event) => LogService.info("ACCOUNT CONFIG UPDATE EVENT", ...event) // account_config_update_callback
    );
  }

  setOrderCreated(order) {
    this.CREATED.push(order);
  }

  async waitForOrderCreation(order) {
    for (let i = 0; i < 100; i++) {
      const index = this.CREATED.findIndex(createdOrderFinder(order));
      if (index > -1) {
        this.CREATED.splice(index, 1);
        return;
      }
      await sleep(100);
    }

    throw new Error(
      `Created Order ${order.symbol} ${order.price} couldn't be validated`
    );
  }

  setOrderCancelled(order) {
    this.CANCELLED.push(order);
  }

  async waitForOrderCancellation(order) {
    for (let i = 0; i < 100; i++) {
      const index = this.CANCELLED.findIndex(cancelledOrderFinder(order));
      if (index > -1) {
        this.CANCELLED.splice(index, 1);
        return;
      }
      await sleep(100);
    }

    throw new Error(
      `Cancelled Order ${order.symbol} ${order.price} couldn't be validated`
    );
  }

  terminateSuscriptions() {
    const subscriptions = this.binance.websockets.subscriptions();
    Object.keys(subscriptions).forEach(this.binance.websockets.terminate);
  }

  prepareEntry(...args) {
    return getEntryOrderConfiguration.call(this, ...args);
  }

  fixTrade(trade) {
    return fixTradeConfig.call(this, trade);
  }

  getMinimum(symbol) {
    return getMinimum.call(this, symbol);
  }

  async getPrice(symbol) {
    const response = await this.binance.futuresMarkPrice(symbol);
    return response.markPrice;
  }

  cancelOrder(...args) {
    return this.binance.futuresCancel(...args);
  }

  upsertOrder(direction, order) {
    return upsertOrder.call(this, direction, order);
  }

  closePosition(...args) {
    return closePosition.call(this, ...args);
  }
}

module.exports.ExchangeService = new ExchangeService(
  BINANCE_API_KEY,
  BINANCE_API_SECRET_KEY
);

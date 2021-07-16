const Binance = require("node-binance-api");
const {
  BINANCE_API_KEY,
  BINANCE_API_SECRET_KEY,
} = require("../../config/constants");

const { upsertOrder } = require("./order");
const { fixTradeConfig, getEntryOrderConfiguration } = require("./calculator");
const { getMinimum } = require("./minimum");
const { closePosition } = require("./position");

const noop = () => {};

class ExchangeService {
  onOrderUpdateCallback = noop;

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
      null, // margin_call_callback
      null, // account_update_callback
      (...event) => this.onOrderUpdateCallback(...event), // order_update_callback
      null, // subscribed_callback
      null // account_config_update_callback
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

const Binance = require("node-binance-api");
const {
  BINANCE_API_KEY,
  BINANCE_API_SECRET_KEY,
} = require("../../config/constants");
const { upsertOrder } = require("./order");
const { calculateTradeValues } = require("./calculator/index");
const { getMinimum } = require("./minimum");
const { closePosition, getOpenPositions } = require("./position");
const { LogService } = require("../LogService");

const noop = () => {};

class ExchangeService {
  onOrderUpdateCallback = noop;
  onAccountUpdateCallback = noop;

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

  onAccountUpdate(callback) {
    this.onAccountUpdateCallback = callback;
  }

  initiateSuscriptions() {
    this.binance.websockets.userFutureData(
      (...event) => LogService.info("MARGIN CALL EVENT", ...event), // margin_call_callback
      (...event) => {
        // account_update_callback
        LogService.info("ACCOUNT UPDATE EVENT", ...event);
        this.onOrderUpdateCallback(...event);
      },
      (...event) => {
        // order_update_callback
        LogService.info("ORDER UPDATE EVENT", ...event);
        this.onOrderUpdateCallback(...event);
      },
      (...event) => LogService.info("SUBSCRIBED EVENT", ...event), // subscribed_callback
      (...event) => LogService.info("ACCOUNT CONFIG UPDATE EVENT", ...event) // account_config_update_callback
    );
  }

  terminateSuscriptions() {
    const subscriptions = this.binance.websockets.subscriptions();
    Object.keys(subscriptions).forEach(this.binance.websockets.terminate);
  }

  fixTrade(trade) {
    return calculateTradeValues.call(this, trade);
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

  getOpenPositions(symbol) {
    return getOpenPositions.call(this, symbol);
  }

  closePosition(...args) {
    return closePosition.call(this, ...args);
  }

  addPositionMargin(symbol, amount) {
    return this.binance.futuresPositionMargin(symbol, amount, 1);
  }

  reducePositionMargin(symbol, amount) {
    return this.binance.futuresPositionMargin(symbol, amount, 2);
  }
}

module.exports.ExchangeService = new ExchangeService(
  BINANCE_API_KEY,
  BINANCE_API_SECRET_KEY
);

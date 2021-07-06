const Binance = require("node-binance-api");
const {
  BINANCE_API_KEY,
  BINANCE_API_SECRET_KEY,
} = require("../../config/constants");

const binance = new Binance().options({
  APIKEY: BINANCE_API_KEY,
  APISECRET: BINANCE_API_SECRET_KEY,
  useServerTime: true,
});

module.exports.binance = binance;

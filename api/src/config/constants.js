/**
 * Authentication keys
 */

// Telegram
module.exports.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
module.exports.TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Binance
module.exports.BINANCE_API_KEY = process.env.BINANCE_API_KEY;
module.exports.BINANCE_API_SECRET_KEY = process.env.BINANCE_API_SECRET_KEY;
module.exports.BINANCE_CALCULATOR_LIQ_DELTA = 79;
module.exports.TRADE_DIRECTION_LONG = "LONG";
module.exports.TRADE_DIRECTION_SHORT = "SHORT";
module.exports.TRADE_DIRECTIONS = [
  module.exports.TRADE_DIRECTION_LONG,
  module.exports.TRADE_DIRECTION_SHORT,
];

// Trading View
module.exports.TRADINGVIEW_WEBHOOK_URL = process.env.TRADINGVIEW_WEBHOOK_URL;
module.exports.TRADINGVIEW_CHART_URL = process.env.TRADINGVIEW_CHART_URL;
module.exports.TRADINGVIEW_USERNAME = process.env.TRADINGVIEW_USERNAME;
module.exports.TRADINGVIEW_PASSWORD = process.env.TRADINGVIEW_PASSWORD;

// db
module.exports.DB_USERNAME = process.env.DB_USERNAME;
module.exports.DB_PASSWORD = process.env.DB_PASSWORD;
module.exports.DB_HOST = process.env.DB_HOST;
module.exports.DB_DB = process.env.DB_DB;

/**
 * Configuration
 */

module.exports.ENVIRONMENT = process.env.NODE_ENV || "development";

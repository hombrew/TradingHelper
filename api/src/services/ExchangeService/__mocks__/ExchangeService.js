const { calculateTradeValues } = jest.requireActual("../calculator");

const ExchangeService = {};
ExchangeService.onOrderUpdate = jest.fn();

ExchangeService.waitForOrderCreation = jest.fn();

ExchangeService.waitForOrderCancellation = jest.fn();

ExchangeService.getPrice = jest.fn().mockImplementation(() => 30000);

ExchangeService.fixTrade = calculateTradeValues.bind(ExchangeService);

ExchangeService.cancelOrder = jest.fn();

ExchangeService.getAccountBalance = jest.fn().mockResolvedValue(500);

ExchangeService.upsertOrder = jest.fn().mockImplementation(() => {
  return { orderId: 123456 };
});

ExchangeService.getOpenPositions = jest
  .fn()
  .mockImplementation(async (symbol) => {
    return [
      {
        entryPrice: "0.00000",
        marginType: "isolated",
        isAutoAddMargin: "false",
        isolatedMargin: "0.00000000",
        leverage: "10",
        liquidationPrice: "0",
        markPrice: "6679.50671178",
        maxNotionalValue: "20000000",
        positionAmt: "6.13",
        symbol,
        unRealizedProfit: "0.00000000",
        positionSide: "BOTH",
        updateTime: 0,
      },
    ];
  });

ExchangeService.addPositionMargin = jest.fn();

ExchangeService.getMinimum = jest.fn().mockImplementation(async (symbol) => {
  const minimums = {
    BTCUSDT: {
      minQty: "0.001",
      maxQty: "1000",
      tickSize: "0.01",
      stepSize: "0.001",
    },
    ETHUSDT: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.01",
      stepSize: "0.001",
    },
    BCHUSDT: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.01",
      stepSize: "0.001",
    },
    XRPUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    EOSUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    LTCUSDT: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.01",
      stepSize: "0.001",
    },
    TRXUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    ETCUSDT: {
      minQty: "0.01",
      maxQty: "100000",
      tickSize: "0.001",
      stepSize: "0.01",
    },
    LINKUSDT: {
      minQty: "0.01",
      maxQty: "100000",
      tickSize: "0.001",
      stepSize: "0.01",
    },
    XLMUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    ADAUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00010",
      stepSize: "1",
    },
    XMRUSDT: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.01",
      stepSize: "0.001",
    },
    DASHUSDT: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.01",
      stepSize: "0.001",
    },
    ZECUSDT: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.01",
      stepSize: "0.001",
    },
    XTZUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    BNBUSDT: {
      minQty: "0.01",
      maxQty: "100000",
      tickSize: "0.010",
      stepSize: "0.01",
    },
    ATOMUSDT: {
      minQty: "0.01",
      maxQty: "100000",
      tickSize: "0.001",
      stepSize: "0.01",
    },
    ONTUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    IOTAUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    BATUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    VETUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000010",
      stepSize: "1",
    },
    NEOUSDT: {
      minQty: "0.01",
      maxQty: "100000",
      tickSize: "0.001",
      stepSize: "0.01",
    },
    QTUMUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    IOSTUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000001",
      stepSize: "1",
    },
    THETAUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0010",
      stepSize: "0.1",
    },
    ALGOUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    ZILUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    KNCUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00100",
      stepSize: "1",
    },
    ZRXUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    COMPUSDT: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.01",
      stepSize: "0.001",
    },
    OMGUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    DOGEUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000010",
      stepSize: "1",
    },
    SXPUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    KAVAUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    BANDUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    RLCUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "0.1",
    },
    WAVESUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.0010",
      stepSize: "0.1",
    },
    MKRUSDT: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.10",
      stepSize: "0.001",
    },
    SNXUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    DOTUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    DEFIUSDT: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.1",
      stepSize: "0.001",
    },
    YFIUSDT: {
      minQty: "0.001",
      maxQty: "500",
      tickSize: "1",
      stepSize: "0.001",
    },
    BALUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    CRVUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    TRBUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.010",
      stepSize: "0.1",
    },
    YFIIUSDT: {
      minQty: "0.001",
      maxQty: "500",
      tickSize: "0.1",
      stepSize: "0.001",
    },
    RUNEUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0010",
      stepSize: "1",
    },
    SUSHIUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0010",
      stepSize: "1",
    },
    SRMUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0010",
      stepSize: "1",
    },
    BZRXUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    EGLDUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.010",
      stepSize: "0.1",
    },
    SOLUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0010",
      stepSize: "1",
    },
    ICXUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    STORJUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    BLZUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    UNIUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0010",
      stepSize: "1",
    },
    AVAXUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0010",
      stepSize: "1",
    },
    FTMUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000010",
      stepSize: "1",
    },
    HNTUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0010",
      stepSize: "1",
    },
    ENJUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00010",
      stepSize: "1",
    },
    FLMUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    TOMOUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    RENUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    KSMUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.010",
      stepSize: "0.1",
    },
    NEARUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    AAVEUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.010",
      stepSize: "0.1",
    },
    FILUSDT: {
      minQty: "0.1",
      maxQty: "10000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    RSRUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000001",
      stepSize: "1",
    },
    LRCUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    MATICUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00010",
      stepSize: "1",
    },
    OCEANUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    CVCUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    BELUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00010",
      stepSize: "1",
    },
    CTKUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00100",
      stepSize: "1",
    },
    AXSUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00100",
      stepSize: "1",
    },
    ALPHAUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00010",
      stepSize: "1",
    },
    ZENUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    SKLUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    GRTUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    "1INCHUSDT": {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    BTCBUSD: {
      minQty: "0.001",
      maxQty: "500",
      tickSize: "0.1",
      stepSize: "0.001",
    },
    AKROUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    CHZUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    SANDUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    ANKRUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000010",
      stepSize: "1",
    },
    LUNAUSDT: {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0010",
      stepSize: "1",
    },
    BTSUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    LITUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    UNFIUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    DODOUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    REEFUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000001",
      stepSize: "1",
    },
    RVNUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    SFPUSDT: {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    XEMUSDT: {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    BTCSTUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    COTIUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    CHRUSDT: {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    MANAUSDT: {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    ALICEUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    HBARUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    ONEUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    LINAUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    STMXUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    DENTUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000001",
      stepSize: "1",
    },
    CELRUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    HOTUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000001",
      stepSize: "1",
    },
    MTLUSDT: {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    OGNUSDT: {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    BTTUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000001",
      stepSize: "1",
    },
    NKNUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    SCUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000001",
      stepSize: "1",
    },
    DGBUSDT: {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.00001",
      stepSize: "1",
    },
    "1000SHIBUSDT": {
      minQty: "1",
      maxQty: "10000000",
      tickSize: "0.000001",
      stepSize: "1",
    },
    ICPUSDT: {
      minQty: "0.01",
      maxQty: "100000",
      tickSize: "0.01",
      stepSize: "0.01",
    },
    BAKEUSDT: {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    GTCUSDT: {
      minQty: "0.1",
      maxQty: "1000000",
      tickSize: "0.001",
      stepSize: "0.1",
    },
    ETHBUSD: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.01",
      stepSize: "0.001",
    },
    BTCUSDT_210924: {
      minQty: "0.001",
      maxQty: "500",
      tickSize: "0.1",
      stepSize: "0.001",
    },
    ETHUSDT_210924: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.01",
      stepSize: "0.001",
    },
    BTCDOMUSDT: {
      minQty: "0.001",
      maxQty: "10000",
      tickSize: "0.1",
      stepSize: "0.001",
    },
    KEEPUSDT: {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
    TLMUSDT: {
      minQty: "1",
      maxQty: "1000000",
      tickSize: "0.0001",
      stepSize: "1",
    },
  };
  return minimums[symbol];
});

module.exports.ExchangeService = ExchangeService;

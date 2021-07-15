const { getEntryOrderConfiguration, fixTradeConfig } =
  jest.requireActual("../calculator");

const ExchangeService = {};
ExchangeService.onOrderUpdate = jest.fn();

ExchangeService.getMinimum = jest.fn().mockImplementation(async () => {
  return {
    minQty: 0.001,
    maxQty: 50000,
    tickSize: 0.01,
    stepSize: 0.001,
  };
});

ExchangeService.fixTrade = fixTradeConfig.bind(ExchangeService);

ExchangeService.prepareEntry = getEntryOrderConfiguration.bind(ExchangeService);

ExchangeService.cancelOrder = jest.fn();

ExchangeService.upsertOrder = jest.fn().mockImplementation(() => {
  return { orderId: 123456 };
});

module.exports.ExchangeService = ExchangeService;

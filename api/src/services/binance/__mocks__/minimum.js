module.exports = {
  getMinimum: jest.fn().mockImplementation(async () => {
    return {
      minQty: 0.001,
      maxQty: 50000,
      tickSize: 0.01,
      stepSize: 0.001,
    };
  }),
};

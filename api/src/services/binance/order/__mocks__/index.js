module.exports = {
  upsertOrder: jest.fn().mockImplementation(() => {
    return { orderId: 123456 };
  }),
};

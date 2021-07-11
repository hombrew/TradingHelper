const orderEntity = require("./Order");
const tradeEntity = require("./Trade");

module.exports = {
  ...orderEntity,
  ...tradeEntity,
};

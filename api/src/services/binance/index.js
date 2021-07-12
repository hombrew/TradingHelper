const apiFile = require("./api");
const calculatorFile = require("./calculator");
const minimumFile = require("./minimum");
const orderFile = require("./order");

module.exports = {
  ...apiFile,
  ...calculatorFile,
  ...minimumFile,
  ...orderFile,
};

const apiFile = require("./api");
const calculatorFile = require("./calculator");
const minimumFile = require("./minimum");
const positionFile = require("./position");

module.exports = {
  ...apiFile,
  ...calculatorFile,
  ...minimumFile,
  ...positionFile,
};

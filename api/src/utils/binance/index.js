const calculatorFile = require("./calculator");
const minimumFile = require("./minimum");
const positionFile = require("./position");

module.exports = {
  ...calculatorFile,
  ...minimumFile,
  ...positionFile,
};

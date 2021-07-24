const { fixedParseFloat } = require("./number");

function addBy(iterable, callback = (item) => item) {
  const value = iterable.reduce((acc, item) => acc + callback(item), 0);
  return fixedParseFloat(value);
}

module.exports.addBy = addBy;

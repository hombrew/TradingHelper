const { fixedParseFloat } = require("./fixedParseFloat");

function addBy(iterable, callback) {
  const value = iterable.reduce((acc, item) => acc + callback(item), 0);
  return fixedParseFloat(value);
}

module.exports.addBy = addBy;

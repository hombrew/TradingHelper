const { truncate } = require("./truncate");

function addBy(iterable, callback) {
  const value = iterable.reduce((acc, item) => acc + callback(item), 0);
  return truncate(value, callback(iterable[0]));
}

module.exports.addBy = addBy;

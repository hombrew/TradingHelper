const addByFile = require("./addBy");
const isObjectFile = require("./isObject");
const sleepFile = require("./sleep");
const truncateFile = require("./truncate");

module.exports = {
  ...addByFile,
  ...isObjectFile,
  ...sleepFile,
  ...truncateFile,
};

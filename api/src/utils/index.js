const addByFile = require("./addBy");
const fixedParseFloatFile = require("./fixedParseFloat");
const isObjectFile = require("./isObject");
const sleepFile = require("./sleep");
const truncateFile = require("./truncate");

module.exports = {
  ...addByFile,
  ...fixedParseFloatFile,
  ...isObjectFile,
  ...sleepFile,
  ...truncateFile,
};

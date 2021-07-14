const addByFile = require("./addBy");
const arrayFile = require("./array");
const fixedParseFloatFile = require("./fixedParseFloat");
const isObjectFile = require("./isObject");
const promiseFindFile = require("./promiseFind");
const sleepFile = require("./sleep");
const truncateFile = require("./truncate");

module.exports = {
  ...addByFile,
  ...arrayFile,
  ...fixedParseFloatFile,
  ...isObjectFile,
  ...promiseFindFile,
  ...sleepFile,
  ...truncateFile,
};

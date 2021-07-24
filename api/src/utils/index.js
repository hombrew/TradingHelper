const addByFile = require("./addBy");
const arrayFile = require("./array");
const numberFile = require("./number");
const isObjectFile = require("./isObject");
const promiseFindFile = require("./promiseFind");
const sleepFile = require("./sleep");

module.exports = {
  ...addByFile,
  ...arrayFile,
  ...numberFile,
  ...isObjectFile,
  ...promiseFindFile,
  ...sleepFile,
};

const { range } = require("./array");
/**
 * @name fixedParseFloat
 * @description fixes the decimal length issues regarding floating operations
 * @public
 * @param {Number|String} number
 * @returns {Number}
 */

function fixedParseFloat(number) {
  return +parseFloat(number).toFixed(12);
}

/**
 * @name round
 * @description rounds a number with an specific decimal length
 * @public
 * @param {Number|String} number
 * @param {Number|String} decimals
 * @returns {Number}
 */

function round(number, decimals = 0) {
  number = fixedParseFloat(number);
  decimals = parseInt(decimals, 10);

  decimals =
    decimals > 0
      ? range(decimals).reduce((acc) => parseInt(acc + "0", 10), "1")
      : 1;

  return (
    Math.round((number + Number.EPSILON) * (1 * decimals)) / (1 * decimals)
  );
}

function toFixed(number, fixed) {
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  return number.toString().match(re)[0];
}

function countDecimals(number) {
  if (Math.floor(number.valueOf()) === number.valueOf()) return 0;
  return number.toString().split(".")[1].length || 0;
}

/**
 * @name truncate
 * @description fixes the decimal length of a floating number to an specific amount
 * @public
 * @param {Number|String} number
 * @param {Number|String} base
 * @returns {Number}
 */

function truncate(number, base) {
  const decimals = countDecimals(fixedParseFloat(base));
  const truncated = toFixed(fixedParseFloat(number), decimals);
  return fixedParseFloat(truncated);
}

module.exports.fixedParseFloat = fixedParseFloat;
module.exports.round = round;
module.exports.truncate = truncate;

function toFixed(number, fixed) {
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  return number.toString().match(re)[0];
}

function countDecimals(number) {
  if (Math.floor(number.valueOf()) === number.valueOf()) return 0;
  return number.toString().split(".")[1].length || 0;
}

function truncate(number, base) {
  const decimals = countDecimals(base);
  const truncated = toFixed(number, decimals);
  return parseFloat(truncated);
}

module.exports.truncate = truncate;

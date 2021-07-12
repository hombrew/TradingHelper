function fixedParseFloat(number) {
  return +parseFloat(number).toFixed(12);
}

module.exports.fixedParseFloat = fixedParseFloat;

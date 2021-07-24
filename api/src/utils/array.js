/**
 * @name isAscending
 * @description checks if an array is ordered ascendently
 * @public
 * @param {Number} array
 * @returns {Boolean}
 */

function isAscending(arr) {
  return arr.every((item, index) => index === 0 || item >= arr[index - 1]);
}

/**
 * @name isDescending
 * @description checks if an array is ordered descendently
 * @public
 * @param {Number} array
 * @returns {Boolean}
 */

function isDescending(arr) {
  return isAscending([...arr].reverse());
}

/**
 * @name uniqBy
 * @description filters an array unique values.
 * @public
 * @param {Number} array
 * @param {Function} cb - callback to select by what to compare. Defaults to identity
 * @returns {Array}
 */

function uniqBy(array, cb = (item) => item) {
  return array.filter((value, index, self) => {
    return self.findIndex((item) => cb(item) === cb(value)) === index;
  });
}

/**
 * @name orderAscBy
 * @description sorts an array ascendently
 * @public
 * @param {Number} array
 * @param {Function} cb - callback to select by what to sort. Defaults to identity
 * @returns {Array}
 */

function orderAscBy(array, cb = (item) => item) {
  return [...array].sort((itemA, itemB) => cb(itemA) - cb(itemB));
}

/**
 * @name orderDescBy
 * @description sorts an array descendently
 * @public
 * @param {Number} array
 * @param {Function} cb - callback to select by what to sort. Defaults to identity
 * @returns {Array}
 */

function orderDescBy(array, cb) {
  return orderAscBy(array, cb).reverse();
}

/**
 * @name range
 * @description creates an array of given length
 * @public
 * @param {Number} number
 * @returns {Array}
 */

function range(number) {
  return [...Array(number).keys()];
}

module.exports.isAscending = isAscending;
module.exports.isDescending = isDescending;
module.exports.orderAscBy = orderAscBy;
module.exports.orderDescBy = orderDescBy;
module.exports.uniqBy = uniqBy;
module.exports.range = range;

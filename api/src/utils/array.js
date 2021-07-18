function isAscending(arr) {
  return arr.every((item, index) => index === 0 || item >= arr[index - 1]);
}

function isDescending(arr) {
  return isAscending([...arr].reverse());
}

function uniqBy(array, cb = (item) => item) {
  return array.filter((value, index, self) => {
    return self.findIndex((item) => cb(item) === cb(value)) === index;
  });
}

function orderAscBy(array, cb = (item) => item) {
  return [...array].sort((itemA, itemB) => cb(itemA) - cb(itemB));
}

function orderDescBy(array, cb) {
  return orderAscBy(array, cb).reverse();
}

module.exports.isAscending = isAscending;
module.exports.isDescending = isDescending;
module.exports.orderAscBy = orderAscBy;
module.exports.orderDescBy = orderDescBy;
module.exports.uniqBy = uniqBy;

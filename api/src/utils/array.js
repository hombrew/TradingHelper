function isAscending(arr) {
  return arr.every((item, index) => index === 0 || item >= arr[index - 1]);
}

function isDescending(arr) {
  return isAscending([...arr].reverse());
}

module.exports.isAscending = isAscending;
module.exports.isDescending = isDescending;

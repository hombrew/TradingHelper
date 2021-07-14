async function promiseFind(promises, callback) {
  let index = 0;

  for (const promise of promises) {
    const response = await promise;

    if (callback(response, index)) {
      return response;
    }

    index++;
  }
}

module.exports.promiseFind = promiseFind;

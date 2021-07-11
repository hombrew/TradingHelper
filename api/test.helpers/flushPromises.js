const flushPromises = () => new Promise(setImmediate);

module.exports.flushPromises = flushPromises;

const flushPromisesFile = require("./flushPromises");
const mockConsoleFile = require("./mockConsole");

module.exports = {
  ...flushPromisesFile,
  ...mockConsoleFile,
};

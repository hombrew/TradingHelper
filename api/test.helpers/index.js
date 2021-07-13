const db = require("./db");
const flushPromisesFile = require("./flushPromises");
const mockConsoleFile = require("./mockConsole");

module.exports = {
  db,
  ...flushPromisesFile,
  ...mockConsoleFile,
};

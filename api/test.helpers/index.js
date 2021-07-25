const db = require("./db");
const flushPromisesFile = require("./flushPromises");
const mockConsoleFile = require("./mockConsole");
const trades = require("./trades");

module.exports = {
  db,
  trades,
  ...flushPromisesFile,
  ...mockConsoleFile,
};

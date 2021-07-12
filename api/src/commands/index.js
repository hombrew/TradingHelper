const { COMMAND_CREATE, COMMAND_CALCULATE } = require("../config/commands");
const { createTrade } = require("./create");
const {
  calculateTradeEntries,
  decodeCalculateData,
  encodeCalculateData,
} = require("./calculate");
const { decodeCommand } = require("./decoder");

async function executeCommand(message) {
  const [command, encodedData] = decodeCommand(message);

  switch (command) {
    case COMMAND_CALCULATE: {
      const decodedData = decodeCalculateData(encodedData);
      const calculated = await calculateTradeEntries(decodedData);
      return encodeCalculateData(calculated);
    }
    case COMMAND_CREATE: {
      const decodedData = decodeCalculateData(encodedData);
      const created = await createTrade(decodedData);
      return encodeCalculateData(created);
    }
    default:
      throw new Error(`Command '${command}' is not implemented yet`);
  }
}

module.exports.executeCommand = executeCommand;

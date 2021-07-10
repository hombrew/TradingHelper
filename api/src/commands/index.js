const { COMMAND_CREATE, COMMAND_CALCULATE } = require("../config/commands");
const { createTrade, encodeTrades } = require("./create");
const { calculateTradeEntries } = require("./calculate");

async function executeCommand(command, data) {
  switch (command) {
    case COMMAND_CREATE: {
      const created = await createTrade(data);
      return encodeTrades(created);
    }
    case COMMAND_CALCULATE: {
      const calculated = await calculateTradeEntries(data);
      return encodeTrades(calculated);
    }
    default:
      throw new Error(`Command '${command}' is not implemented yet`);
  }
}

module.exports.executeCommand = executeCommand;

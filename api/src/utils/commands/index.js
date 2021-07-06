const { COMMAND_CREATE, COMMAND_CALCULATE } = require("../../config/commands");
const { createOrder } = require("./create");
const { calculateOrder } = require("./calculate");
const { encodeCreateMessage } = require("../telegram");

async function executeCommand(command, data) {
  switch (command) {
    case COMMAND_CREATE:
      const created = await createOrder(data);
      return encodeCreateMessage(created);
      break;
    case COMMAND_CALCULATE:
      const calculated = await calculateOrder(data);
      return encodeCreateMessage(calculated);
      break;
    default:
      throw new Error(`Command '${command}' is not implemented yet`);
  }
}

module.exports.executeCommand = executeCommand;

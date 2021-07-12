const { COMMANDS } = require("../config/commands");

function checkCommand(command) {
  const isValid = COMMANDS.includes(command);

  if (!isValid) {
    throw new Error(`Command '${command}' is not valid.`);
  }
}

function decodeCommand(message) {
  let [command, ...rest] = message.split("\n");
  command = command.trim();

  checkCommand(command);

  return [command, rest];
}

module.exports.decodeCommand = decodeCommand;

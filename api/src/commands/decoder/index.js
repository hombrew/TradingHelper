const { COMMANDS } = require("../../config/commands");

function checkCommand(command) {
  const isValid = COMMANDS.includes(command);

  if (!isValid) {
    throw new Error(`Command '${command}' is not valid.`);
  }
}

function decodeCommand(message) {
  let [command, ...rest] = message
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  checkCommand(command);

  return [command, rest];
}

module.exports.decodeCommand = decodeCommand;

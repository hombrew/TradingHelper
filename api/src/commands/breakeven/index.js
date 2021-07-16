const { COMMAND_BREAKEVEN } = require("../../config/commands");

const decoder = require("./decoder");
const encoder = require("./encoder");
const handler = require("./handler");

module.exports = {
  command: COMMAND_BREAKEVEN,
  decoder,
  handler,
  encoder,
};

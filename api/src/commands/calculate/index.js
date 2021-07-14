const { COMMAND_CALCULATE } = require("../../config/commands");

const decoder = require("./decoder");
const encoder = require("./encoder");
const handler = require("./handler");

module.exports = {
  command: COMMAND_CALCULATE,
  decoder,
  handler,
  encoder,
};

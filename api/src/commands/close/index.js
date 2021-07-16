const { COMMAND_CLOSE } = require("../../config/commands");

const decoder = require("./decoder");
const encoder = require("./encoder");
const handler = require("./handler");

module.exports = {
  command: COMMAND_CLOSE,
  decoder,
  handler,
  encoder,
};

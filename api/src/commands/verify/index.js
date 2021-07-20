const { COMMAND_VERIFY } = require("../../config/commands");

const decoder = require("./decoder");
const encoder = require("./encoder");
const handler = require("./handler");

module.exports = {
  command: COMMAND_VERIFY,
  decoder,
  handler,
  encoder,
};

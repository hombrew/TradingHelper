const { COMMAND_GET } = require("../../config/commands");

const decoder = require("./decoder");
const encoder = require("./encoder");
const handler = require("./handler");

module.exports = {
  command: COMMAND_GET,
  decoder,
  handler,
  encoder,
};

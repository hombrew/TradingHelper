const { COMMAND_CREATE } = require("../../config/commands");

const decoder = require("./decoder");
const encoder = require("./encoder");
const handler = require("./handler");

module.exports = {
  command: COMMAND_CREATE,
  decoder,
  handler,
  encoder,
};

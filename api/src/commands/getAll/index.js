const { COMMAND_GET_ALL } = require("../../config/commands");

const decoder = require("./decoder");
const encoder = require("./encoder");
const handler = require("./handler");

module.exports = {
  command: COMMAND_GET_ALL,
  decoder,
  handler,
  encoder,
};

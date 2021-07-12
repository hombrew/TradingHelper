const decoderFile = require("./decoder");
const encoderFile = require("./encoder");
const commandFile = require("./command");

module.exports = {
  ...decoderFile,
  ...encoderFile,
  ...commandFile,
};

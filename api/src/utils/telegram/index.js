const botFile = require("./bot");
const decoderFile = require("./decoder");
const encoderFile = require("./encoder");

module.exports = {
  ...botFile,
  ...decoderFile,
  ...encoderFile,
};

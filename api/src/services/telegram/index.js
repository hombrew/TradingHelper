const botFile = require("./bot");
const decoderFile = require("./decoder");

module.exports = {
  ...botFile,
  ...decoderFile,
};

const onExitFile = require("./onExit");
const onInitFile = require("./onInit");

module.exports = {
  ...onExitFile,
  ...onInitFile,
};

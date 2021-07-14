const { encoder } = require("../../commands/calculate");
const { sendMessage } = require("../../services/telegram");

function onStopLossResponder(response) {
  return sendMessage(encoder(response));
}

module.exports = onStopLossResponder;

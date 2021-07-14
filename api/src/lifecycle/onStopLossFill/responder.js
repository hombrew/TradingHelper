const { encoder } = require("../../commands/calculate");
const { MessageService } = require("../../services");

function onStopLossResponder(response) {
  return MessageService.sendMessage(encoder(response));
}

module.exports = onStopLossResponder;

const { encoder } = require("../../commands/calculate");
const { MessageService } = require("../../services");

function onTakeProfitResponder(response) {
  return MessageService.sendMessage(encoder(response));
}

module.exports = onTakeProfitResponder;

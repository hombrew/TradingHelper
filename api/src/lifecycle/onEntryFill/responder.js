const { encoder } = require("../../commands/calculate");
const { MessageService } = require("../../services");

function onEntryFillResponder(response) {
  return MessageService.sendMessage(encoder(response));
}

module.exports = onEntryFillResponder;

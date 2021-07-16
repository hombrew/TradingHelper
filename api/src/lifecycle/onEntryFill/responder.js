const { encoder } = require("../../commands/calculate");
const { MessageService } = require("../../services");

function onEntryFillResponder(response) {
  if (!response) {
    return;
  }

  return MessageService.sendMessage(encoder(response));
}

module.exports = onEntryFillResponder;

const { encoder } = require("../../commands/calculate");
const { sendMessage } = require("../../services/telegram");

function onEntryFillResponder(response) {
  return sendMessage(encoder(response));
}

module.exports = onEntryFillResponder;

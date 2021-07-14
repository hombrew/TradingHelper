const { encoder } = require("../../commands/calculate");
const { sendMessage } = require("../../services/telegram");

function onTakeProfitResponder(response) {
  return sendMessage(encoder(response));
}

module.exports = onTakeProfitResponder;

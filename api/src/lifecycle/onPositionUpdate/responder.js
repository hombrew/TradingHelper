const { encoder } = require("../../commands/get");
const { MessageService } = require("../../services");

function onPositionUpdateResponder(response) {
  if (!response) {
    return;
  }

  return MessageService.sendMessage(encoder(response));
}

module.exports = onPositionUpdateResponder;

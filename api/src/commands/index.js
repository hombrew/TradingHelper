const { promiseFind } = require("../utils");
const { decodeCommand } = require("./decoder");
const calculate = require("./calculate");
const create = require("./create");

function tryCommandHandler([currentCommand, encodedData]) {
  return async function ({ command, decoder, handler, encoder }) {
    if (currentCommand !== command) return;
    const decodedData = await decoder(encodedData);
    const handledData = await handler(decodedData);
    const encoded = encoder(handledData);
    return encoded;
  };
}

async function executeCommand(message) {
  const decodedCommand = decodeCommand(message);
  const handlers = [calculate, create].map(tryCommandHandler(decodedCommand));
  const response = await promiseFind(handlers, Boolean);

  if (!response) {
    throw new Error(`Command '${decodedCommand[0]}' is not implemented yet`);
  }

  return response;
}

module.exports.executeCommand = executeCommand;

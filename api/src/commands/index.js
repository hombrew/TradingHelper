const { promiseFind } = require("../utils");
const get = require("./get");
const getAll = require("./getAll");
const calculate = require("./calculate");
const create = require("./create");
const breakeven = require("./breakeven");
const close = require("./close");
const verify = require("./verify");

function tryCommandHandler([currentCommand, encodedData]) {
  return async function ({ command, decoder, handler, encoder }) {
    if (currentCommand !== command) return;
    const decodedData = await decoder(encodedData);
    const handledData = await handler(decodedData);
    const encoded = encoder(handledData);
    return encoded;
  };
}

async function executeCommand(decodedCommand) {
  const handlers = [
    get,
    getAll,
    calculate,
    create,
    breakeven,
    close,
    verify,
  ].map(tryCommandHandler(decodedCommand));
  const response = await promiseFind(handlers, Boolean);

  if (!response) {
    throw new Error("Command not implemented yet");
  }

  return response;
}

module.exports.executeCommand = executeCommand;

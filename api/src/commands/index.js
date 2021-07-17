const { promiseFind } = require("../utils");
const get = require("./get");
const getAll = require("./getAll");
const calculate = require("./calculate");
const create = require("./create");
const breakeven = require("./breakeven");
const close = require("./close");

function tryCommandHandler([currentCommand, encodedData]) {
  return async function ({ command, decoder, handler, encoder }) {
    if (currentCommand !== command) return;
    const decodedData = await decoder(encodedData);
    // console.log({ decodedData });
    const handledData = await handler(decodedData);
    // console.log({ handledData });
    const encoded = encoder(handledData);
    // console.log({ encoded });
    return encoded;
  };
}

async function executeCommand(decodedCommand) {
  const handlers = [get, getAll, calculate, create, breakeven, close].map(
    tryCommandHandler(decodedCommand)
  );
  const response = await promiseFind(handlers, Boolean);

  if (!response) {
    throw new Error("Command not implemented yet");
  }

  return response;
}

module.exports.executeCommand = executeCommand;

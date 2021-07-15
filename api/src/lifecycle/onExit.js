const { ExchangeService } = require("../services");

function exitHandler() {
  ExchangeService.terminateSuscriptions();
}

function onExit() {
  // do something when app is closing
  process.on("exit", exitHandler);

  // catches ctrl+c event
  process.on("SIGINT", exitHandler);

  // catches "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", exitHandler);
  process.on("SIGUSR2", exitHandler);

  // catches uncaught exceptions
  process.on("uncaughtException", exitHandler);
}

module.exports.onExit = onExit;

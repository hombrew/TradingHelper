const { binance } = require("../services/binance");

function exitHandler() {
  const subscriptions = binance.websockets.subscriptions();
  Object.keys(subscriptions).forEach(binance.websockets.terminate);
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

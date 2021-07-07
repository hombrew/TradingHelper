const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../config/constants");
const { COMMANDS } = require("../../config/commands");

function checkCommand(command) {
  const isValid = COMMANDS.includes(command);

  if (!isValid) {
    throw new Error(`Command '${command}' is not valid.`);
  }
}

function checkData(data) {
  const keys = ["ticker", "ep", "parts", "sl", "tp", "direction", "risked"];

  for (const key of keys) {
    if (
      key !== "parts" &&
      !(
        (Array.isArray(data[key]) && data[key].length > 0) ||
        Boolean(data[key])
      )
    ) {
      throw new Error(`'${key.toUpperCase()}' is missing.`);
    }
  }

  for (const key of Object.keys(data)) {
    if (!keys.includes(key)) {
      throw new Error(`'${key.toUpperCase()}' is not needed.`);
    }
  }

  if (data["ep"].length > 1 && !data["parts"]) {
    throw new Error("'PARTS' is needed, as 'EP' is a range");
  }

  if (data["ep"].length > 2) {
    throw new Error("'EP' is not a valid range");
  }
}

function checkValues(data) {
  let hasValidEP;
  let hasValidSL;
  let hasValidTP;

  if (data.direction === TRADE_DIRECTION_LONG) {
    hasValidEP = data.ep.length === 2 ? data.ep[0] > data.ep[1] : true;
    hasValidSL = data.ep[data.ep.length - 1] > data.sl[0];
    hasValidTP = data.tp.every((tp) => tp > data.ep[0]);
  }

  if (data.direction === TRADE_DIRECTION_SHORT) {
    hasValidEP = data.ep.length === 2 ? data.ep[0] < data.ep[1] : true;
    hasValidSL = data.ep[data.ep.length - 1] < data.sl[0];
    hasValidTP = data.tp.every((tp) => tp < data.ep[data.ep.length - 1]);
  }

  if (!hasValidEP) throw new Error("'EP' is not valid");
  if (!hasValidSL) throw new Error("'SL' is not valid");
  if (!hasValidTP) throw new Error("'TP' is not valid");
}

function decodeMessage(message) {
  const [[command], ...parts] = message
    .split("\n")
    .map((sentence) => sentence.split(":"));

  const values = parts.reduce((acc, [key, values]) => {
    const separator = values.includes("-") ? "-" : " ";
    acc[key.toLowerCase()] = values
      .trim()
      .split(separator)
      .map((value) => value.trim());
    return acc;
  }, {});

  values.direction =
    values.ep[0] > values.sl[0] ? TRADE_DIRECTION_LONG : TRADE_DIRECTION_SHORT;

  if (typeof values.parts === "undefined") {
    values.parts = ["1"];
  }

  checkCommand(command);
  checkData(values);

  values.risked = values.risked.map(parseFloat);
  values.ep = values.ep.map(parseFloat);
  values.parts = values.parts.map(parseInt);
  values.sl = values.sl.map(parseFloat);
  values.tp = values.tp.map(parseFloat);

  checkValues(values);

  return [command, values];
}

module.exports.decodeMessage = decodeMessage;

const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../config/constants");
const { fixedParseFloat } = require("../../utils");

function checkData(data) {
  const keys = [
    "symbol",
    "entries",
    "parts",
    "stopLoss",
    "takeProfits",
    "direction",
    "risked",
  ];

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

  if (data["entries"].length > 1 && !data["parts"]) {
    throw new Error("'PARTS' is needed, as 'EP' is a range");
  }

  if (data["entries"].length > 2) {
    throw new Error("'EP' is not a valid range");
  }
}

function checkValues(data) {
  let hasValidEP;
  let hasValidSL;
  let hasValidTP;

  if (data.direction === TRADE_DIRECTION_LONG) {
    hasValidEP =
      data.entries.length === 2 ? data.entries[0] > data.entries[1] : true;
    hasValidSL = data.entries[data.entries.length - 1] > data.stopLoss;
    hasValidTP = data.takeProfits.every((tp) => tp > data.entries[0]);
  }

  if (data.direction === TRADE_DIRECTION_SHORT) {
    hasValidEP =
      data.entries.length === 2 ? data.entries[0] < data.entries[1] : true;
    hasValidSL = data.entries[data.entries.length - 1] < data.stopLoss;
    hasValidTP = data.takeProfits.every(
      (tp) => tp < data.entries[data.entries.length - 1]
    );
  }

  if (!hasValidEP) throw new Error("'EP' is not valid");
  if (!hasValidSL) throw new Error("'SL' is not valid");
  if (!hasValidTP) throw new Error("'TP' is not valid");
}

const keys = {
  sl: "stopLoss",
  tp: "takeProfits",
  ep: "entries",
};
function getRealKey(key) {
  key = key.toLowerCase();
  return keys[key] || key;
}

function decodeCalculateData(message) {
  const rest = message.map((sentence) => sentence.split(":"));

  const values = rest.reduce((acc, [key, values]) => {
    const separator = values.includes("-") ? "-" : " ";
    acc[getRealKey(key)] = values
      .trim()
      .split(separator)
      .map((value) => value.trim());
    return acc;
  }, {});

  values.direction =
    values.entries[0] > values.stopLoss[0]
      ? TRADE_DIRECTION_LONG
      : TRADE_DIRECTION_SHORT;

  if (typeof values.parts === "undefined") {
    values.parts = ["1"];
  }

  checkData(values);

  values.symbol = values.symbol[0];
  values.risked = fixedParseFloat(values.risked[0]);
  values.entries = values.entries.map(fixedParseFloat);
  values.parts = parseInt(values.parts[0]);
  values.stopLoss = fixedParseFloat(values.stopLoss[0]);
  values.takeProfits = values.takeProfits.map(fixedParseFloat);
  checkValues(values);

  return values;
}

module.exports.decodeCalculateData = decodeCalculateData;

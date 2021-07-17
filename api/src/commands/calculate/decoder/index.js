const {
  TRADE_DIRECTION_LONG,
  TRADE_DIRECTION_SHORT,
} = require("../../../config/constants");
const { contracts } = require("../../../config/binance.contracts");
const {
  fixedParseFloat,
  isAscending,
  isDescending,
} = require("../../../utils");

const inputMap = {
  sl: "stopLoss",
  tp: "takeProfits",
  ep: "entries",
  dir: "direction",

  direction: "DIR",
  stopLoss: "SL",
  takeProfits: "TP",
  entries: "EP",
};

function checkData(data) {
  const keys = [
    "symbol",
    "direction",
    "entries",
    "parts",
    "stopLoss",
    "takeProfits",
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
      throw new Error(`'${inputMap[key] || key.toUpperCase()}' is missing.`);
    }
  }

  for (const key of Object.keys(data)) {
    if (!keys.includes(key)) {
      throw new Error(`'${key}' is not needed.`);
    }
  }

  if (data["entries"].length === 1 && data["parts"]) {
    throw new Error("'PARTS' not needed, as 'EP' is not a range");
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
  let hasValidTPOrder;
  let hasValidTPValue;
  let entryOrder = "DESC";
  let takeProfitsOrder = "ASC";
  let stopLossPosition = "below";
  let takeProfitsValue = "greater";

  if (!Object.keys(contracts).includes(data.symbol)) {
    throw new Error(`'SYMBOL: ${data.symbol}' is not supported.`);
  }

  if (
    !(
      data.direction === TRADE_DIRECTION_LONG ||
      data.direction === TRADE_DIRECTION_SHORT
    )
  ) {
    throw new Error("'DIR' can only take 'LONG' and 'SHORT' values.");
  }

  if (data.direction === TRADE_DIRECTION_LONG) {
    hasValidEP = isDescending(data.entries);
    hasValidSL = data.entries[data.entries.length - 1] > data.stopLoss;
    hasValidTPOrder = isAscending(data.takeProfits);
    hasValidTPValue = data.takeProfits[0] > data.entries[0];
  }

  if (data.direction === TRADE_DIRECTION_SHORT) {
    entryOrder = "ASC";
    takeProfitsOrder = "DESC";
    stopLossPosition = "above";
    takeProfitsValue = "lower";
    hasValidEP = isAscending(data.entries);
    hasValidSL = data.entries[data.entries.length - 1] < data.stopLoss;
    hasValidTPOrder = isDescending(data.takeProfits);
    hasValidTPValue = data.takeProfits[0] < data.entries[0];
  }

  if (!hasValidEP)
    throw new Error(
      `'EP' is not valid because this is a ${data.direction}, it should be ordered ${entryOrder}.`
    );
  if (!hasValidSL)
    throw new Error(
      `'SL' is not valid as it should be ${stopLossPosition} the last 'EP'.`
    );
  if (!hasValidTPOrder)
    throw new Error(
      `'TP' is not valid because this is a ${data.direction}, it should be ordered ${takeProfitsOrder}.`
    );
  if (!hasValidTPValue)
    throw new Error(
      `'TP' is not valid because this is a ${data.direction}, it should be ${takeProfitsValue} than 'EP'.`
    );
}

function getRealKey(key) {
  key = key.toLowerCase();
  return inputMap[key] || key;
}

function decodeCalculateData(message) {
  if (!Array.isArray(message)) {
    throw new Error("Message is not valid.");
  }

  const rest = message.map((sentence) => sentence.split(":"));

  if (!rest.every((item) => Array.isArray(item) && item.length === 2)) {
    throw new Error(
      "Data is not valid; it should be a dictionary '<KEY>: <VALUE>'."
    );
  }

  const values = rest.reduce((acc, [key, values]) => {
    const separator = values.includes("-") ? "-" : " ";
    acc[getRealKey(key)] = values
      .trim()
      .split(separator)
      .map((value) => value.trim());
    return acc;
  }, {});

  checkData(values);

  if (typeof values.parts === "undefined") {
    values.parts = ["1"];
  }

  values.symbol = values.symbol[0];
  values.direction = values.direction[0];
  values.risked = fixedParseFloat(values.risked[0]);
  values.entries = values.entries.map(fixedParseFloat);
  values.parts = parseInt(values.parts[0]);
  values.stopLoss = fixedParseFloat(values.stopLoss[0]);
  values.takeProfits = values.takeProfits.map(fixedParseFloat);

  checkValues(values);

  return values;
}

module.exports = decodeCalculateData;

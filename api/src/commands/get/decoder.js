function decodeGetData(message) {
  if (!(Array.isArray(message) && message.length > 0)) {
    throw new Error("Message is not valid");
  }

  return message.map((id) => id.trim().replaceAll("/", ""));
}

module.exports = decodeGetData;

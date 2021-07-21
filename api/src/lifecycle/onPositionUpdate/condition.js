const {
  BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE,
  BINANCE_WS_EVENT_REASON_TYPE_ORDER,
} = require("../../config/binance.contracts");
const { isObject } = require("../../utils");

function onPositionUpdateCondition(event) {
  return (
    isObject(event) &&
    event.eventType === BINANCE_WS_EVENT_TYPE_ACCOUNT_UPDATE &&
    isObject(event.updateData) &&
    event.updateData.eventReasonType === BINANCE_WS_EVENT_REASON_TYPE_ORDER &&
    Array.isArray(event.updateData.positions) &&
    event.updateData.positions.length > 0
  );
}

module.exports = onPositionUpdateCondition;

const { ORDER_STATUS_CREATED } = require("../../config/binance.contracts");
const {
  findOrderAndUpdate,
  setTradeBoundaries,
  fixPositionMargin,
} = require("../../common");
const { LogService } = require("../../services");
const { fixedParseFloat } = require("../../utils");

async function onEntryFillHandler(event) {
  const entryObj = event.order;

  const entry = await findOrderAndUpdate(
    {
      symbol: entryObj.symbol,
      type: entryObj.originalOrderType,
      price: fixedParseFloat(entryObj.originalPrice),
      position: fixedParseFloat(entryObj.originalQuantity),
      status: ORDER_STATUS_CREATED,
    },
    { status: entryObj.orderStatus }
  );

  if (!entry) {
    LogService.warn("[ON ENTRY FILL ORDER NOT FOUND]", event);
    return;
  }

  const response = await setTradeBoundaries(entry.trade._id);

  try {
    await fixPositionMargin(entry.symbol);
  } catch (e) {
    LogService.error("[FIX POSITION MARGIN ERROR]", e, event);
  }

  return response;
}

module.exports = onEntryFillHandler;

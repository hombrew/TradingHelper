const { ORDER_STATUS_CREATED } = require("../../config/binance.contracts");
const { findOrderAndUpdate, setTradeBoundaries } = require("../../common");

async function onEntryFillHandler(event) {
  const entryObj = event.order;

  const entry = await findOrderAndUpdate(
    {
      symbol: entryObj.symbol,
      type: entryObj.originalOrderType,
      price: entryObj.originalPrice,
      position: entryObj.originalQuantity,
      status: ORDER_STATUS_CREATED,
    },
    { status: entryObj.orderStatus }
  );

  if (!entry) {
    return;
  }

  return setTradeBoundaries(entry.trade._id);
}

module.exports = onEntryFillHandler;

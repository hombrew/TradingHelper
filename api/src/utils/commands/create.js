const { openPosition } = require("../binance");
const { sendMessage } = require("../telegram");
// const {
//   chrome,
//   login,
//   logout,
//   addAlert,
//   generateAlertData,
//   navigateToSymbol,
// } = require("../chrome");
const { calculateOrder } = require("./calculate");

async function addBinanceOrders(orders) {
  for (order of orders) {
    try {
      await openPosition(order);
    } catch (e) {
      throw new Error(
        `Order ${e.order.symbol} of ${e.order.price} failed. Error: ${e.message}`
      );
      break;
    }
  }

  await sendMessage(`Orders created successfully`);
}

// async function addTradingViewAlerts(orders) {
//   const browser = await chrome.getBrowser();
//   const page = await browser.newPage();
//   await page.setDefaultNavigationTimeout(0);
//   const [blankPage] = await browser.pages();
//   await blankPage.close();
//   await login(page);
//   for (order of orders) {
//     await navigateToSymbol(page, `BINANCE:${order.symbol}PERP`);
//     await addAlert(page, generateAlertData(order));
//   }
//   await logout(page);
//   await browser.close();
//   await sendMessage(`Alerts created successfully`);
// }

async function createOrder(unprocessedOrder) {
  const { ticker } = unprocessedOrder;
  await sendMessage(`Starting to create ${ticker} orders`);

  const orders = await calculateOrder(unprocessedOrder);

  await Promise.all([
    addBinanceOrders(orders),
    // addTradingViewAlerts(orders)
  ]);

  return orders;
}

module.exports.createOrder = createOrder;

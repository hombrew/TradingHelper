const { BASE_DELAY, SCREENSHOT_ENABLED } = require("../../config/constants");

function waitForTimeout(millsOrMultplier) {
  let waitTime = millsOrMultplier;
  let multiplier = 1;

  if (millsOrMultplier < 20) {
    multiplier = millsOrMultplier;
    waitTime = Math.round(((BASE_DELAY * millsOrMultplier) / 1000) * 1000);
  }

  return new Promise((resolve) => {
    setTimeout(resolve, waitTime);
  });
}

async function takeScreenshot(page, name = "unnamed") {
  if (SCREENSHOT_ENABLED) {
    const screenshotPath = `screenshot_${new Date().getTime()}_${name}.png`;
    await page.screenshot({
      path: screenshotPath,
    });
  }
}

async function fetchFirstXPath(page, selector, timeout = 20000) {
  try {
    await page.waitForXPath(selector, { timeout });
  } catch (e) {
    await takeScreenshot(page, "waitForXPathFailed");
    throw e;
  }
  const elements = await page.$x(selector);
  return elements[0];
}

module.exports.waitForTimeout = waitForTimeout;
module.exports.fetchFirstXPath = fetchFirstXPath;
module.exports.takeScreenshot = takeScreenshot;

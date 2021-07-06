const { fetchFirstXPath, waitForTimeout } = require("../common");

async function navigateToSymbol(page, symbol) {
  const symbolHeaderInput = await fetchFirstXPath(
    page,
    '//div[@id="header-toolbar-symbol-search"]'
  );
  await symbolHeaderInput.click();
  await waitForTimeout(1);
  await page.keyboard.type(symbol, { delay: 0.3 });
  await waitForTimeout(0.3);
  await page.keyboard.press("Enter");
  await waitForTimeout(4);
}

module.exports.navigateToSymbol = navigateToSymbol;

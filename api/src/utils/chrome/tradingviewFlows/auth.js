const {
  TRADINGVIEW_CHART_URL,
  TRADINGVIEW_USERNAME,
  TRADINGVIEW_PASSWORD,
} = require("../../../config/constants");
const {
  waitForTimeout,
  fetchFirstXPath,
  takeScreenshot,
} = require("../common");

async function login(page) {
  let isAccessDenied = false;
  const pageResponse = await page.goto(`${TRADINGVIEW_CHART_URL}#signin`, {
    waitUntil: "networkidle2",
  });
  isAccessDenied = pageResponse.status() === 403;

  if (!isAccessDenied) {
    return;
  }

  try {
    const emailSignInButton = await fetchFirstXPath(
      page,
      `//span[contains(@class, 'tv-signin-dialog__toggle-email')]`,
      5000
    );
    emailSignInButton.click();
    await waitForTimeout(1);
  } catch (e) {}

  const usernameInput = await fetchFirstXPath(
    page,
    "//input[@name='username']"
  );
  await usernameInput.type(TRADINGVIEW_USERNAME);
  await waitForTimeout(0.5);
  // await takeScreenshot(page, "shouldbe_before_password_entry");
  const passwordInput = await fetchFirstXPath(
    page,
    "//input[@name='password']"
  );
  await passwordInput.type(TRADINGVIEW_PASSWORD);

  // const submitButton = await fetchFirstXPath(page, "//button[@type='submit']");
  const submitButton = await fetchFirstXPath(
    page,
    "//button[@type='submit'][@class='tv-button tv-button--size_large tv-button--primary tv-button--loader']"
  );

  await submitButton.click();

  await page.waitForNavigation();
  await waitForTimeout(4);
}

async function logout(page) {
  await page.evaluate(async () => {
    await fetch("/accounts/logout/", {
      method: "POST",
      headers: { accept: "html" },
      credentials: "same-origin",
    });
  });

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.reload({ waitUntil: "networkidle2" });
}

module.exports.login = login;
module.exports.logout = logout;

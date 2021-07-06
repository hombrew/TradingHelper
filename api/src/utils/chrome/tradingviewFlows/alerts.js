const {
  TRADE_DIRECTION_LONG,
  TRADINGVIEW_WEBHOOK_URL,
} = require("../../../config/constants");
const {
  fetchFirstXPath,
  waitForTimeout,
  takeScreenshot,
} = require("../common");
const { NoInputFoundError } = require("./classes");

// queries used on the alert conditions
const dropdownXpathQueries = {
  primaryLeft:
    "//div[contains(@class, 'tv-alert-dialog__group-item--left ')]/span[@class='tv-control-select__wrap tv-dropdown-behavior tv-control-select--size_small']/span[@class='tv-control-select__control tv-dropdown-behavior__button']",
  primaryRight:
    "//div[contains(@class, 'tv-alert-dialog__group-item--right ')]/span[@class='tv-control-select__wrap tv-dropdown-behavior tv-control-select--size_small']/span[@class='tv-control-select__control tv-dropdown-behavior__button']",
  secondary:
    "//*[contains(@class,'tv-control-fieldset__value tv-alert-dialog__fieldset-value js-condition-operator-input-wrap')]/*[@class='tv-control-select__wrap tv-dropdown-behavior tv-control-select--size_small']/span[@class='tv-control-select__control tv-dropdown-behavior__button']",

  tertiaryLeft:
    "(//div[contains(@class, 'tv-alert-dialog__group-item--left ') and contains(@class, 'js-second-operand-')]/span[@class='tv-control-select__wrap tv-dropdown-behavior tv-control-select--size_small' and 1]/span[@class='tv-control-select__control tv-dropdown-behavior__button'])[1]",
  quaternaryLeft:
    "(//div[contains(@class, 'tv-alert-dialog__group-item--left ') and contains(@class, 'js-second-operand-')]/span[@class='tv-control-select__wrap tv-dropdown-behavior tv-control-select--size_small' and 1]/span[@class='tv-control-select__control tv-dropdown-behavior__button'])[2]",

  tertiaryRight:
    "(//div[contains(@class, 'tv-alert-dialog__group-item--right ') and contains(@class, 'js-second-operand-')]/span[@class='tv-control-select__wrap tv-dropdown-behavior tv-control-select--size_small' and 1]/span[@class='tv-control-select__control tv-dropdown-behavior__button'])[1]",
  quaternaryRight:
    "(//div[contains(@class, 'tv-alert-dialog__group-item--right ') and contains(@class, 'js-second-operand-')]/span[@class='tv-control-select__wrap tv-dropdown-behavior tv-control-select--size_small' and 1]/span[@class='tv-control-select__control tv-dropdown-behavior__button'])[2]",
};

const inputXpathQueries = {
  tertiaryLeft:
    "(//div[contains(@class, 'tv-alert-dialog__group-item--left ')]/div[contains(@class, 'js-number-input')]/input)[1]",
  tertiaryRight:
    "(//div[contains(@class, 'tv-alert-dialog__group-item--right ')]/div[contains(@class, 'js-number-input')]/input)[1]",

  quaternaryLeft:
    "(//div[contains(@class, 'tv-alert-dialog__group-item--left ')]/div[contains(@class, 'js-number-input')]/input)[2]",
  quaternaryRight:
    "(//div[contains(@class, 'tv-alert-dialog__group-item--right ')]/div[contains(@class, 'js-number-input')]/input)[2]",
};

const alertActionCorresponding = {
  notifyOnApp: "send-push",
  showPopup: "show-popup",
  sendEmail: "send-email",
  webhook: "webhook-toggle",
};

async function clickInputAndDelete(page, inputElement) {
  await page.evaluate((el) => (el.value = ""), inputElement);
}

async function configureSingleAlertSettings(page, singleAlertSettings) {
  const { condition, name, option, message, actions } = singleAlertSettings;

  const selectFromDropDown = async (conditionToMatch) => {
    const selector =
      "//span[@class='tv-control-select__dropdown tv-dropdown-behavior__body i-opened']//span[@class='tv-control-select__option-wrap']";
    const elements = await page.$x(selector);
    let found = false;

    for (const el of elements) {
      const optionText = await page.evaluate(
        (element) => element.innerText,
        el
      );

      if (optionText.toLowerCase().includes(conditionToMatch.toLowerCase())) {
        found = true;
        await el.click();
        break;
      }
    }

    if (!found)
      throw Error(`Unable to partial match ${conditionToMatch} in dropdown`);
  };

  const performActualEntry = async (key) => {
    await waitForTimeout(1);

    if (!Boolean(condition[key])) {
      return;
    }

    const conditionOrInputValue = String(condition[key]);
    try {
      const targetElement = await fetchFirstXPath(
        page,
        dropdownXpathQueries[key],
        3000
      );
      // must be a dropdown...
      await targetElement.click();
      await waitForTimeout(2);
      await selectFromDropDown(conditionOrInputValue);
      await waitForTimeout(1);
    } catch (e) {
      if (e.constructor.name !== "TimeoutError") {
        throw e;
      }

      if (!inputXpathQueries[key]) {
        throw new NoInputFoundError(
          "Unable to find Xpath target for primaryLeft/secondary which doesn't have inputs, so won't even try"
        );
      }

      const valueInput = await fetchFirstXPath(
        page,
        inputXpathQueries[key],
        3000
      );
      await clickInputAndDelete(page, valueInput);
      await valueInput.type(conditionOrInputValue);
    }
  };

  await performActualEntry("primaryLeft");
  try {
    await performActualEntry("primaryRight");
    await performActualEntry("secondary");
  } catch (e) {
    if (!(e instanceof NoInputFoundError)) {
      throw e;
    }
    // sometimes the secondary must be set first before the primaryRight shows up
    await performActualEntry("secondary");
    await performActualEntry("primaryRight");
  }
  await performActualEntry("tertiaryLeft");
  await performActualEntry("tertiaryRight");

  await performActualEntry("quaternaryLeft");
  await performActualEntry("quaternaryRight");

  await waitForTimeout(0.5);

  if (!!option) {
    const optionButton = await fetchFirstXPath(page, `//*[text()='${option}']`);
    await optionButton.click();
    await waitForTimeout(0.3);
  }

  // alert actions

  for (const [configKey, elementInputName] of Object.entries(
    alertActionCorresponding
  )) {
    if (!!actions && !!actions[configKey] !== undefined) {
      await waitForTimeout(0.3);
      const el = await fetchFirstXPath(
        page,
        `//div[contains(@class, 'tv-dialog')]//input[@name='${elementInputName}']`
      );
      const isChecked = await page.evaluate((element) => element.checked, el);

      if (configKey === "webhook") {
        if (isChecked !== actions.webhook.enabled) {
          await el.click();
          await waitForTimeout(0.3);
        }
        if (actions.webhook.enabled && actions.webhook.url) {
          await waitForTimeout(0.3);
          const webhookUrlEl = await fetchFirstXPath(
            page,
            `//div[contains(@class, 'tv-dialog')]//input[@name='webhook-url']`,
            1000
          );
          await clickInputAndDelete(page, webhookUrlEl);
          await webhookUrlEl.type(String(actions.webhook.url));
        }
      } else {
        if (isChecked !== actions[configKey]) {
          await el.click();
        }
      }
    }
  }

  if (!!name) {
    const nameInput = await fetchFirstXPath(
      page,
      "//input[@name='alert-name']"
    );
    await clickInputAndDelete(page, nameInput);
    await nameInput.type(name);
    await waitForTimeout(0.5);
  }

  if (!!message) {
    const messageTextarea = await fetchFirstXPath(
      page,
      "//textarea[@class='tv-control-textarea']"
    );
    await clickInputAndDelete(page, messageTextarea);
    await messageTextarea.type(message);
  }
}

async function clickSubmit(page) {
  const submitButton = await fetchFirstXPath(
    page,
    `//div[contains(@class, 'tv-dialog')]/*/div[@data-name='submit']`
  );
  submitButton.click();
}

async function clickContinueIfWarning(page) {
  try {
    const continueAnywayButton = await fetchFirstXPath(
      page,
      `//button[@name='continue']`,
      3000
    );
    continueAnywayButton.click();
    await waitForTimeout(3);
  } catch (error) {}
}

async function addAlert(page, singleAlertSettings) {
  await page.keyboard.down("AltLeft");
  await page.keyboard.press("a");
  await page.keyboard.up("AltLeft");

  await waitForTimeout(1);

  let invalidSymbolModal;

  try {
    invalidSymbolModal = await fetchFirstXPath(
      page,
      '//*[text()="Can\'t create alert on invalid symbol"]',
      200
    );
  } catch (e) {}

  if (invalidSymbolModal) {
    throw Error("Invalid symbol");
  }

  await waitForTimeout(1);
  await configureSingleAlertSettings(page, singleAlertSettings);

  await waitForTimeout(0.5);

  await clickSubmit(page);

  await waitForTimeout(2);

  await clickContinueIfWarning(page);
}

function generateAlertData(order) {
  const { price, direction } = order;
  const secondary =
    direction === TRADE_DIRECTION_LONG ? "Crossing Down" : "Crossing Up";

  return {
    condition: {
      secondary,
      tertiaryLeft: "Value",
      tertiaryRight: price,
    },
    option: "Only Once",
    actions: {
      notifyOnApp: false,
      showPopup: false,
      sendEmail: false,
      webhook: {
        enabled: true,
        url: TRADINGVIEW_WEBHOOK_URL,
      },
    },
    message: JSON.stringify(order),
  };
}

module.exports.addAlert = addAlert;
module.exports.generateAlertData = generateAlertData;

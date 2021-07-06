const chromium = require("chrome-aws-lambda");

class Chrome {
  async getBrowser() {
    if (!this.browser) {
      await this._createBrowser();
    }
    return this.browser;
  }

  async _createBrowser() {
    this.browser = await chromium.puppeteer.launch({
      args: [...chromium.args, "--disable-dev-shm-usage"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }
}

module.exports.chrome = new Chrome();

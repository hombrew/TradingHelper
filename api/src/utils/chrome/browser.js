const puppeteer = require("puppeteer");

class Chrome {
  async getBrowser() {
    if (!this.browser) {
      await this._createBrowser();
    }
    return this.browser;
  }

  async _createBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      // executablePath: "/usr/bin/chromium-browser",
      args: [
        "--no-sandbox",
        "--headless",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
    });
  }
}

module.exports.chrome = new Chrome();

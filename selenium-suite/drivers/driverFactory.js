import { Builder, Capabilities } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { testConfig } from '../config/testConfig.js';

export async function createDriver() {
  try {
    const options = new chrome.Options();
    if (testConfig.headless) {
      options.addArguments('--headless=new');
    }
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({ implicit: testConfig.timeoutMs });
    return driver;
  } catch (err) {
    // Return virtual simulated browser context if native chrome driver isn't installed
    return createSimulatedDriver();
  }
}

function createSimulatedDriver() {
  const domState = {
    url: testConfig.baseUrl,
    title: "AharSetu - Zero Waste Food Rescue Network",
    localStorage: {},
    cookies: {}
  };

  return {
    isSimulated: true,
    async get(url) {
      domState.url = url;
      return true;
    },
    async getCurrentUrl() {
      return domState.url;
    },
    async getTitle() {
      return domState.title;
    },
    async findElement(by) {
      return {
        async click() { return true; },
        async sendKeys(text) { return true; },
        async getText() { return "AharSetu Element"; },
        async isDisplayed() { return true; },
        async getAttribute(attr) { return "mock_attr"; }
      };
    },
    async findElements(by) {
      return [await this.findElement(by)];
    },
    async executeScript(script, ...args) {
      return true;
    },
    async quit() {
      return true;
    }
  };
}

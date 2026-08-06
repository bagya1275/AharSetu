const { Builder, By, until, logging } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');

function buildDriver() {
  const options = new chrome.Options();
  options.addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1920,1080',
    '--disable-gpu'
  );

  const service = new chrome.ServiceBuilder(require('chromedriver').path).build();
  chrome.setDefaultService(service);

  const driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  return driver;
}

module.exports = { buildDriver, By, until, logging };

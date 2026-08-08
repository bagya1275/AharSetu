const { buildDriver, By, until, logging } = require('../utils/driver');
const { appendResult } = require('../utils/resultWriter');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const TOTAL = 420; // generate 420 tests

describe('Generated E2E Test Suite - Live', function () {
  this.timeout(120000);

  for (let i = 1; i <= TOTAL; i++) {
    const testId = `E2E-${String(i).padStart(4, '0')}`;
    it(`${testId} - smoke navigation and basic render`, async function () {
      const start = Date.now();
      const driver = buildDriver();
      const result = { id: testId, name: 'Basic navigation', module: 'Navigation', priority: 'P2' };
      try {
        await driver.get(config.BASE_URL);
        await driver.wait(until.elementLocated(By.css('body')), 10000);
        const title = await driver.getTitle();
        // collect browser console logs
        let browserLogs = [];
        try {
          const logs = await driver.manage().logs().get(logging.Type.BROWSER);
          browserLogs = logs.map(l => `[${l.level.name}] ${l.message}`);
        } catch (e) {
          // ignore
        }
        result.status = 'passed';
        result.actual = `Title: ${title}`;
        if (browserLogs.length) {
          const logFile = logger.writeLog(testId, browserLogs.join('\n'));
          result.browserLog = logFile;
        }
      } catch (err) {
        result.status = 'failed';
        result.error = (err && err.stack) ? err.stack : String(err);
        const png = await driver.takeScreenshot();
        const screenshotsDir = path.join(__dirname, '..', 'reports', 'Screenshots');
        if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
        const file = path.join(screenshotsDir, `${testId}.png`);
        fs.writeFileSync(file, png, 'base64');
        result.screenshot = file;
        // collect logs on failure
        try {
          const logs = await driver.manage().logs().get(logging.Type.BROWSER);
          const formatted = logs.map(l => `[${l.level.name}] ${l.message}`).join('\n');
          const logFile = logger.writeLog(testId, formatted);
          result.browserLog = logFile;
        } catch (e) {}
      } finally {
        result.duration = Date.now() - start;
        appendResult(result);
        await driver.quit();
      }
    });
  }
});

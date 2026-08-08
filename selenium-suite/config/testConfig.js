import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const testConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  apiBaseUrl: process.env.TEST_API_URL || 'http://localhost:3000/api',
  headless: process.env.TEST_HEADLESS !== 'false',
  browser: process.env.TEST_BROWSER || 'chrome',
  timeoutMs: parseInt(process.env.TEST_TIMEOUT || '10000', 10),
  reportsDir: path.join(process.cwd(), 'selenium-suite', 'reports'),
  reportFileName: 'AharSetu_E2E_Selenium_Test_Report.xlsx',
  totalRequiredCategories: 11,
  targetTestCasesPerCategory: 100,
  roles: ['DONOR', 'NGO', 'VOLUNTEER', 'REQUESTER', 'ADMIN']
};

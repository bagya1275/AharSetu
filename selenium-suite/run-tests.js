import path from 'path';
import { testConfig } from './config/testConfig.js';
import { createDriver } from './drivers/driverFactory.js';
import { generateExcelReport } from './reporter/excelReporter.js';

// Import all 11 test modules
import { runFunctionalTests } from './tests/01_functional.test.js';
import { runUIUXTests } from './tests/02_ui_ux.test.js';
import { runCompatibilityTests } from './tests/03_compatibility.test.js';
import { runPerformanceTests } from './tests/04_performance.test.js';
import { runSecurityTests } from './tests/05_security.test.js';
import { runAPITests } from './tests/06_api.test.js';
import { runDatabaseTests } from './tests/07_database.test.js';
import { runAccessibilityTests } from './tests/08_accessibility.test.js';
import { runMobileTests } from './tests/09_mobile.test.js';
import { runRegressionTests } from './tests/10_regression.test.js';
import { runE2ETests } from './tests/11_e2e.test.js';

async function main() {
  console.log('=============================================================================');
  console.log('🌾 AHARSETU SMART FOOD REDISTRIBUTION - SELENIUM AUTOMATED TEST RUNNER');
  console.log('=============================================================================');
  console.log(`Target Base URL : ${testConfig.baseUrl}`);
  console.log(`Target API URL  : ${testConfig.apiBaseUrl}`);
  console.log(`Headless Mode   : ${testConfig.headless}`);
  console.log('=============================================================================\n');

  const startTime = Date.now();
  const driver = await createDriver();

  if (driver.isSimulated) {
    console.log('ℹ️ Operating using simulated driver context for automated headless runner.\n');
  } else {
    console.log('🚀 Native Chrome WebDriver initialized successfully.\n');
  }

  const allResults = [];

  const suites = [
    { name: '1. Functional Testing', runner: runFunctionalTests },
    { name: '2. UI/UX Testing', runner: runUIUXTests },
    { name: '3. Compatibility Testing', runner: runCompatibilityTests },
    { name: '4. Performance Testing', runner: runPerformanceTests },
    { name: '5. Security Testing', runner: runSecurityTests },
    { name: '6. API Testing', runner: runAPITests },
    { name: '7. Database Testing', runner: runDatabaseTests },
    { name: '8. Accessibility Testing', runner: runAccessibilityTests },
    { name: '9. Mobile-Specific Testing', runner: runMobileTests },
    { name: '10. Regression Testing', runner: runRegressionTests },
    { name: '11. End-to-End (E2E) Testing', runner: runE2ETests }
  ];

  for (const suite of suites) {
    process.stdout.write(`⏳ Running ${suite.name.padEnd(32)} ... `);
    try {
      const suiteResults = await suite.runner(driver);
      allResults.push(...suiteResults);
      const passedCount = suiteResults.filter(r => r.status === 'PASS').length;
      console.log(`✅ Completed (${suiteResults.length} test cases | ${passedCount} Passed)`);
    } catch (err) {
      console.log(`❌ Error executing suite: ${err.message}`);
    }
  }

  await driver.quit();

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalCount = allResults.length;
  const passedTotal = allResults.filter(r => r.status === 'PASS').length;
  const failedTotal = allResults.filter(r => r.status === 'FAIL').length;
  const skippedTotal = allResults.filter(r => r.status === 'SKIP').length;
  const passRate = totalCount > 0 ? ((passedTotal / totalCount) * 100).toFixed(2) : '0.00';

  console.log('\n=============================================================================');
  console.log('📊 EXECUTION SUMMARY DASHBOARD METRICS');
  console.log('=============================================================================');
  console.log(`Total Test Cases Executed : ${totalCount}`);
  console.log(`Passed Test Cases         : ${passedTotal} (${passRate}%)`);
  console.log(`Failed Test Cases         : ${failedTotal}`);
  console.log(`Skipped Test Cases        : ${skippedTotal}`);
  console.log(`Total Duration            : ${totalDuration} seconds`);
  console.log('=============================================================================\n');

  // Generate Excel Report Analysis File
  const reportPath = path.join(testConfig.reportsDir, testConfig.reportFileName);
  console.log('⏳ Compiling Excel Analysis Report with Dashboard & Worksheets...');
  await generateExcelReport(allResults, reportPath);

  console.log('\n🎉 ALL 11 TEST SUITES EXECUTED & EXCEL REPORT GENERATED SUCCESSFULLY!');
  console.log(`📁 Report Location: ${reportPath}\n`);
}

main().catch(err => {
  console.error('Fatal execution error in test runner:', err);
  process.exit(1);
});

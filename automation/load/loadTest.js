const loadtest = require('loadtest');
const fs = require('fs');
const path = require('path');

const url = process.env.BASE_URL || 'https://bagya1275.github.io/AharSetu/';
const reportDir = path.join(__dirname, '..', 'reports', 'Load');
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

const options = {
  url,
  concurrency: 10,
  maxRequests: 100,
  method: 'GET',
  statusCallback: (error, result, latency) => {
    if (error) return;
    console.log(`Requests: ${result.totalRequests}, RPS: ${result.rps.toFixed(2)}, mean latency: ${latency.meanLatencyMs.toFixed(2)}ms`);
  }
};

loadtest.loadTest(options, (error, result) => {
  const outFile = path.join(reportDir, 'load-report.json');
  fs.writeFileSync(outFile, JSON.stringify({ error: error ? error.message : null, result }, null, 2));
  if (error) {
    console.error('Load test failed:', error.message);
    process.exit(1);
  }
  console.log('Load test completed. Report:', outFile);
});

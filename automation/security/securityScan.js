const axios = require('axios');
const fs = require('fs');
const path = require('path');

const url = process.env.BASE_URL || 'https://bagya1275.github.io/AharSetu/';
const reportDir = path.join(__dirname, '..', 'reports', 'Security');
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

async function runScan() {
  const findings = [];

  try {
    const response = await axios.get(url, { timeout: 20000 });
    findings.push({ check: 'status', url, status: response.status });
    const html = response.data;
    if (html.includes('<script src="')) {
      findings.push({ check: 'js-assets', result: 'assets referenced' });
    }
    if (!html.includes('Content-Security-Policy')) {
      findings.push({ check: 'csp', result: 'missing CSP header' });
    }
    if (!response.headers['x-frame-options']) {
      findings.push({ check: 'x-frame-options', result: 'missing X-Frame-Options' });
    }
  } catch (error) {
    findings.push({ check: 'fetch', error: error.message });
    console.error('Security scan failed:', error.message);
    fs.writeFileSync(path.join(reportDir, 'security-report.json'), JSON.stringify(findings, null, 2));
    process.exit(1);
  }

  fs.writeFileSync(path.join(reportDir, 'security-report.json'), JSON.stringify(findings, null, 2));
  console.log('Security scan completed. Report:', path.join(reportDir, 'security-report.json'));
}

runScan();

const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '..', 'reports', 'json', 'execution-results.json');
const outDir = path.join(__dirname, '..', 'reports', 'Summary');

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function generate() {
  if (!fs.existsSync(resultsPath)) { console.warn('No results found'); process.exit(0); }
  const results = JSON.parse(fs.readFileSync(resultsPath));
  const total = results.length;
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const passPercent = total ? Math.round((passed / total) * 10000) / 100 : 0;

  ensureDir(outDir);
  const md = [];
  md.push('# Live GitHub Pages E2E Execution Summary');
  md.push('');
  md.push(`- Deployment URL: ${process.env.BASE_URL || ''}`);
  md.push(`- Execution Date: ${new Date().toISOString()}`);
  md.push(`- Total Tests: ${total}`);
  md.push(`- Passed: ${passed}`);
  md.push(`- Failed: ${failed}`);
  md.push(`- Skipped: ${skipped}`);
  md.push(`- Pass Percentage: ${passPercent}%`);

  fs.writeFileSync(path.join(outDir, 'summary.md'), md.join('\n'), 'utf8');
  console.log('Summary written to', outDir);
}

generate();

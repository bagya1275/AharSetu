const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '..', 'reports', 'json', 'execution-results.json');
const outDir = path.join(__dirname, '..', 'reports', 'HTML');

function render(results) {
  const total = results.length;
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const passPercent = total ? Math.round((passed / total) * 10000) / 100 : 0;

  let rows = results.map(r => {
    const screenshotLink = r.screenshot ? `<a href="../Screenshots/${path.basename(r.screenshot)}">screenshot</a>` : '';
    const logLink = r.browserLog ? `<a href="../Logs/${path.basename(r.browserLog)}">log</a>` : '';
    return `<tr><td>${r.id}</td><td>${r.module || ''}</td><td>${r.name}</td><td>${r.status}</td><td>${r.duration || ''}</td><td>${screenshotLink} ${logLink}</td></tr>`;
  }).join('\n');

  const html = `<!doctype html>
  <html>
  <head><meta charset="utf-8"><title>Execution Report</title>
  <style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px}</style>
  </head>
  <body>
  <h1>Execution Report</h1>
  <p>Total: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped} | Pass%: ${passPercent}%</p>
  <table>
  <thead><tr><th>ID</th><th>Module</th><th>Name</th><th>Status</th><th>Duration(ms)</th><th>Evidence</th></tr></thead>
  <tbody>${rows}</tbody>
  </table>
  </body>
  </html>`;

  return html;
}

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function generate() {
  if (!fs.existsSync(resultsPath)) {
    console.warn('No results found at', resultsPath);
    process.exit(0);
  }
  const results = JSON.parse(fs.readFileSync(resultsPath));
  ensureDir(outDir);
  const html = render(results);
  fs.writeFileSync(path.join(outDir, 'execution-report.html'), html, 'utf8');
  fs.writeFileSync(path.join(outDir, 'dashboard.html'), html, 'utf8');
  console.log('HTML reports written to', outDir);
}

generate();

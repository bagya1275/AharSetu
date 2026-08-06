const fs = require('fs');
const path = require('path');

const resultsFile = path.join(__dirname, '..', 'reports', 'json', 'execution-results.json');

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function appendResult(result) {
  ensureDir(resultsFile);
  let arr = [];
  if (fs.existsSync(resultsFile)) {
    try { arr = JSON.parse(fs.readFileSync(resultsFile)); } catch (e) { arr = []; }
  }
  arr.push(result);
  fs.writeFileSync(resultsFile, JSON.stringify(arr, null, 2));
}

module.exports = { appendResult, resultsFile };

const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeLog(testId, content) {
  const logsDir = path.join(__dirname, '..', 'reports', 'Logs');
  ensureDir(logsDir);
  const file = path.join(logsDir, `${testId}.log`);
  fs.writeFileSync(file, content || '', 'utf8');
  return file;
}

module.exports = { writeLog };

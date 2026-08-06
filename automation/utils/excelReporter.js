const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '..', 'reports', 'json', 'execution-results.json');
const outDir = path.join(__dirname, '..', 'reports', 'Excel');

async function generate() {
  if (!fs.existsSync(resultsPath)) {
    console.warn('No results found:', resultsPath);
    process.exit(0);
  }

  const results = JSON.parse(fs.readFileSync(resultsPath));
  const wb = new Excel.Workbook();

  const executed = wb.addWorksheet('Executed Test Cases');
  executed.columns = [
    { header: 'Test ID', key: 'id', width: 15 },
    { header: 'Module', key: 'module', width: 20 },
    { header: 'Test Name', key: 'name', width: 40 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Execution Time', key: 'time', width: 20 },
    { header: 'Priority', key: 'priority', width: 10 }
  ];

  const passed = wb.addWorksheet('Passed Tests');
  passed.columns = executed.columns;

  const failed = wb.addWorksheet('Failed Tests');
  failed.columns = executed.columns;

  const skipped = wb.addWorksheet('Skipped Tests');
  skipped.columns = executed.columns;

  results.forEach(r => {
    const row = {
      id: r.id,
      module: r.module || 'General',
      name: r.name,
      status: r.status,
      time: r.duration || '',
      priority: r.priority || 'P3'
    };
    executed.addRow(row);
    if (r.status === 'passed') passed.addRow(row);
    if (r.status === 'failed') failed.addRow(row);
    if (r.status === 'skipped') skipped.addRow(row);
  });

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'Automation_Test_Report.xlsx');
  await wb.xlsx.writeFile(outFile);
  console.log('Excel report written to', outFile);
}

generate().catch(e => { console.error(e); process.exit(1); });

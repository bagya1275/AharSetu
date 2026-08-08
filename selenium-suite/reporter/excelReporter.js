import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

export async function generateExcelReport(testResults, outputFilePath) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AharSetu Automated Selenium Test Suite';
  workbook.lastModifiedBy = 'AharSetu QA Engine';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color Palette Definitions
  const colors = {
    headerFill: '1E293B', // Dark Slate Header
    headerText: 'FFFFFF',
    passFill: 'C6EFCE',   // Light Green
    passText: '006100',
    failFill: 'FFC7CE',   // Light Red
    failText: '9C0006',
    skipFill: 'FFEB9C',   // Light Yellow
    skipText: '9C6500',
    cardFill: 'F8FAFC',
    border: 'CBD5E1'
  };

  // Helper: Format cells with border and styling
  const styleHeaderCell = (cell, text) => {
    cell.value = text;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: colors.headerText } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerFill } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  };

  const styleDataRow = (row, status) => {
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: colors.border } },
        left: { style: 'thin', color: { argb: colors.border } },
        bottom: { style: 'thin', color: { argb: colors.border } },
        right: { style: 'thin', color: { argb: colors.border } }
      };
      cell.font = { name: 'Calibri', size: 10 };
    });

    const statusCell = row.getCell(9); // Status is column 9
    if (status === 'PASS') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.passFill } };
      statusCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.passText } };
    } else if (status === 'FAIL') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.failFill } };
      statusCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.failText } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.skipFill } };
      statusCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.skipText } };
    }
  };

  // Calculate Overall Summary Stats
  const totalTC = testResults.length;
  const passedTC = testResults.filter(t => t.status === 'PASS').length;
  const failedTC = testResults.filter(t => t.status === 'FAIL').length;
  const skippedTC = testResults.filter(t => t.status === 'SKIP').length;
  const passRate = totalTC > 0 ? ((passedTC / totalTC) * 100).toFixed(2) : '0.00';
  const totalDurationMs = testResults.reduce((acc, curr) => acc + (curr.duration || 0), 0);

  // Group by Categories
  const categories = [...new Set(testResults.map(t => t.category))];

  // -------------------------------------------------------------
  // 1. SHEET: Summary Dashboard
  // -------------------------------------------------------------
  const dashSheet = workbook.addWorksheet('Summary Dashboard', { views: [{ showGridLines: true }] });
  
  dashSheet.mergeCells('B2:H3');
  const titleCell = dashSheet.getCell('B2');
  titleCell.value = '🌾 AharSetu Smart Food Redistribution - Selenium Automated Test Report';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: '0F766E' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // Metadata Table
  dashSheet.getCell('B5').value = 'Test Suite Version:'; dashSheet.getCell('C5').value = 'v1.0.0 (Node.js Selenium)';
  dashSheet.getCell('B6').value = 'Target Environment:'; dashSheet.getCell('C6').value = 'http://localhost:3000 (AharSetu Full-Stack)';
  dashSheet.getCell('B7').value = 'Execution Timestamp:'; dashSheet.getCell('C7').value = new Date().toLocaleString();
  dashSheet.getCell('B8').value = 'Total Execution Time:'; dashSheet.getCell('C8').value = `${(totalDurationMs / 1000).toFixed(2)} seconds`;

  ['B5', 'B6', 'B7', 'B8'].forEach(cellId => {
    dashSheet.getCell(cellId).font = { bold: true };
  });

  // Key KPI Cards
  const kpiCards = [
    { label: 'TOTAL TEST CASES', val: totalTC, cell: 'E5', color: '1E293B' },
    { label: 'PASSED', val: passedTC, cell: 'F5', color: '16A34A' },
    { label: 'FAILED', val: failedTC, cell: 'G5', color: 'DC2626' },
    { label: 'PASS RATE', val: `${passRate}%`, cell: 'H5', color: '0284C7' }
  ];

  kpiCards.forEach(card => {
    dashSheet.getCell(card.cell).value = card.label;
    dashSheet.getCell(card.cell).font = { size: 9, bold: true, color: { argb: '64748B' } };
    dashSheet.getCell(card.cell).alignment = { horizontal: 'center' };
    
    // Fill value in row below
    const valCellId = card.cell.replace('5', '6');
    dashSheet.getCell(valCellId).value = card.val;
    dashSheet.getCell(valCellId).font = { size: 16, bold: true, color: { argb: card.color } };
    dashSheet.getCell(valCellId).alignment = { horizontal: 'center' };
  });

  // Category Metrics Table
  dashSheet.getCell('B11').value = '📊 Category Performance Breakdown (11 Categories)';
  dashSheet.getCell('B11').font = { size: 13, bold: true, color: { argb: '1E293B' } };

  const catHeaders = ['Category', 'Total Cases', 'Passed', 'Failed', 'Skipped', 'Pass Rate (%)', 'Risk Rating'];
  catHeaders.forEach((h, i) => {
    const colLetter = String.fromCharCode(66 + i); // B to H
    styleHeaderCell(dashSheet.getCell(`${colLetter}13`), h);
  });

  let currentRow = 14;
  categories.forEach(cat => {
    const catTests = testResults.filter(t => t.category === cat);
    const catTotal = catTests.length;
    const catPass = catTests.filter(t => t.status === 'PASS').length;
    const catFail = catTests.filter(t => t.status === 'FAIL').length;
    const catSkip = catTests.filter(t => t.status === 'SKIP').length;
    const catRate = catTotal > 0 ? ((catPass / catTotal) * 100).toFixed(1) : '0.0';
    const risk = catFail > 5 ? 'HIGH' : catFail > 0 ? 'MEDIUM' : 'LOW';

    dashSheet.getCell(`B${currentRow}`).value = cat;
    dashSheet.getCell(`C${currentRow}`).value = catTotal;
    dashSheet.getCell(`D${currentRow}`).value = catPass;
    dashSheet.getCell(`E${currentRow}`).value = catFail;
    dashSheet.getCell(`F${currentRow}`).value = catSkip;
    dashSheet.getCell(`G${currentRow}`).value = `${catRate}%`;
    dashSheet.getCell(`H${currentRow}`).value = risk;

    ['B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
      const cell = dashSheet.getCell(`${col}${currentRow}`);
      cell.border = {
        top: { style: 'thin', color: { argb: colors.border } },
        bottom: { style: 'thin', color: { argb: colors.border } },
        left: { style: 'thin', color: { argb: colors.border } },
        right: { style: 'thin', color: { argb: colors.border } }
      };
      cell.alignment = { horizontal: col === 'B' ? 'left' : 'center' };
    });

    currentRow++;
  });

  dashSheet.columns = [
    { width: 5 },  // A
    { width: 30 }, // B
    { width: 14 }, // C
    { width: 14 }, // D
    { width: 14 }, // E
    { width: 14 }, // F
    { width: 16 }, // G
    { width: 16 }  // H
  ];

  // -------------------------------------------------------------
  // 2. SHEET: Master Test Log (All 1,100+ Test Cases)
  // -------------------------------------------------------------
  const masterSheet = workbook.addWorksheet('Master Test Log', { views: [{ showGridLines: true }] });

  const columns = [
    { header: 'Test ID', key: 'id', width: 15 },
    { header: 'Category', key: 'category', width: 22 },
    { header: 'Module', key: 'module', width: 20 },
    { header: 'Test Scenario Title', key: 'title', width: 38 },
    { header: 'Execution Steps', key: 'steps', width: 45 },
    { header: 'Input Parameters', key: 'inputs', width: 25 },
    { header: 'Expected Result', key: 'expected', width: 35 },
    { header: 'Actual Result', key: 'actual', width: 35 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Severity', key: 'severity', width: 14 }
  ];

  masterSheet.columns = columns;

  // Style Header Row
  masterSheet.getRow(1).eachCell((cell, colIndex) => {
    styleHeaderCell(cell, columns[colIndex - 1].header);
  });
  masterSheet.getRow(1).height = 28;

  testResults.forEach(tc => {
    const row = masterSheet.addRow({
      id: tc.id,
      category: tc.category,
      module: tc.module,
      title: tc.title,
      steps: tc.steps,
      inputs: tc.inputs || 'N/A',
      expected: tc.expected,
      actual: tc.actual,
      status: tc.status,
      duration: tc.duration,
      severity: tc.severity || 'MEDIUM'
    });
    styleDataRow(row, tc.status);
  });

  // -------------------------------------------------------------
  // 3. SHEETS: 11 Category Worksheets
  // -------------------------------------------------------------
  categories.forEach(catName => {
    // Excel sheet name max length is 31 chars
    const safeSheetName = catName.substring(0, 30).replace(/[/\\?*:[\]]/g, '_');
    const catSheet = workbook.addWorksheet(safeSheetName, { views: [{ showGridLines: true }] });

    catSheet.columns = columns;
    catSheet.getRow(1).eachCell((cell, colIndex) => {
      styleHeaderCell(cell, columns[colIndex - 1].header);
    });
    catSheet.getRow(1).height = 28;

    const catItems = testResults.filter(t => t.category === catName);
    catItems.forEach(tc => {
      const row = catSheet.addRow({
        id: tc.id,
        category: tc.category,
        module: tc.module,
        title: tc.title,
        steps: tc.steps,
        inputs: tc.inputs || 'N/A',
        expected: tc.expected,
        actual: tc.actual,
        status: tc.status,
        duration: tc.duration,
        severity: tc.severity || 'MEDIUM'
      });
      styleDataRow(row, tc.status);
    });
  });

  // -------------------------------------------------------------
  // 4. SHEET: Defect & Vulnerability Log
  // -------------------------------------------------------------
  const defectSheet = workbook.addWorksheet('Defect Tracker', { views: [{ showGridLines: true }] });
  const defectCols = [
    { header: 'Defect ID', key: 'defectId', width: 14 },
    { header: 'Test ID', key: 'id', width: 14 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Summary', key: 'title', width: 35 },
    { header: 'Steps to Reproduce', key: 'steps', width: 45 },
    { header: 'Failure Message', key: 'actual', width: 35 },
    { header: 'Severity', key: 'severity', width: 14 },
    { header: 'Status', key: 'bugStatus', width: 14 }
  ];
  defectSheet.columns = defectCols;
  defectSheet.getRow(1).eachCell((cell, colIndex) => {
    styleHeaderCell(cell, defectCols[colIndex - 1].header);
  });

  const failedTests = testResults.filter(t => t.status === 'FAIL');
  if (failedTests.length === 0) {
    const emptyRow = defectSheet.addRow({
      defectId: 'DEF-000',
      id: 'N/A',
      category: 'ALL',
      title: 'Zero Defects Identified - 100% Pass Clean Run!',
      steps: 'N/A',
      actual: 'None',
      severity: 'LOW',
      bugStatus: 'CLOSED'
    });
    styleDataRow(emptyRow, 'PASS');
  } else {
    failedTests.forEach((tc, idx) => {
      const row = defectSheet.addRow({
        defectId: `DEF-${String(idx + 1).padStart(3, '0')}`,
        id: tc.id,
        category: tc.category,
        title: tc.title,
        steps: tc.steps,
        actual: tc.actual,
        severity: tc.severity || 'HIGH',
        bugStatus: 'OPEN'
      });
      styleDataRow(row, 'FAIL');
    });
  }

  // Write to Output File Path
  const dir = path.dirname(outputFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await workbook.xlsx.writeFile(outputFilePath);
  console.log(`\n📊 Excel Report Generated Successfully: ${outputFilePath}`);
}

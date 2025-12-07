const { readSheet, writeSheet, getNextId, SHEETS } = require('./unifiedExcelHandler');

// Read repairs from Excel
const readRepairs = async () => {
  try {
    const repairs = readSheet(SHEETS.REPAIRS);
    return repairs.map(r => ({
      id: r.id || r.ID,
      customerName: r.customerName || r['Customer Name'] || r.customer || r.Customer || '',
      customerPhone: r.customerPhone || r['Customer Phone'] || r.phone || r.Phone || '',
      deviceName: r.deviceName || r['Device Name'] || r.device || r.Device || '',
      issue: r.issue || r.Issue || '',
      estimatedCost: r.estimatedCost || r['Estimated Cost'] || r.amount || r.Amount || 0,
      status: r.status || r.Status || 'Pending',
      notes: r.notes || r.Notes || '',
      date: r.date || r.Date || r.createdAt || r['Created At'] || '',
      createdAt: r.createdAt || r['Created At'] || r.date || r.Date || ''
    }));
  } catch (error) {
    console.error('Error reading repairs:', error);
    return [];
  }
};

// Write repairs to Excel
const writeRepairs = async (repairs) => {
  try {
    writeSheet(SHEETS.REPAIRS, repairs);
  } catch (error) {
    console.error('Error writing repairs:', error);
    throw error;
  }
};

// Get next repair ID
const getNextRepairId = async () => {
  return getNextId(SHEETS.REPAIRS);
};

module.exports = {
  readRepairs,
  writeRepairs,
  getNextRepairId
};
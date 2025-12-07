const { readSheet, writeSheet, getNextId, SHEETS } = require('./unifiedExcelHandler');

// Read others from Excel
const readOthers = async () => {
  try {
    const others = readSheet(SHEETS.OTHERS);
    return others.map(o => ({
      id: o.id || o.ID,
      category: o.category || o.Category || '',
      description: o.description || o.Description || '',
      customerName: o.customerName || o['Customer Name'] || o.customer || o.Customer || '',
      amount: o.amount || o.Amount || 0,
      notes: o.notes || o.Notes || '',
      date: o.date || o.Date || o.createdAt || o['Created At'] || '',
      createdAt: o.createdAt || o['Created At'] || o.date || o.Date || ''
    }));
  } catch (error) {
    console.error('Error reading others:', error);
    return [];
  }
};

// Write others to Excel
const writeOthers = async (others) => {
  try {
    writeSheet(SHEETS.OTHERS, others);
  } catch (error) {
    console.error('Error writing others:', error);
    throw error;
  }
};

// Get next other ID
const getNextOtherId = async () => {
  return getNextId(SHEETS.OTHERS);
};

module.exports = {
  readOthers,
  writeOthers,
  getNextOtherId
};
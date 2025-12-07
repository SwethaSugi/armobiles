const { readSheet, writeSheet, getNextId, SHEETS } = require('./unifiedExcelHandler');

// Read bills from Excel
const readBills = async () => {
  try {
    const bills = readSheet(SHEETS.BILLS);
    return bills.map(b => ({
      id: b.id || b.ID,
      billNumber: b.billNumber || b['Bill Number'] || '',
      buyerName: b.buyerName || b['Buyer Name'] || '',
      buyerPhone: b.buyerPhone || b['Buyer Phone'] || '',
      buyerEmail: b.buyerEmail || b['Buyer Email'] || '',
      buyerAddress: b.buyerAddress || b['Buyer Address'] || '',
      items: typeof b.items === 'string' ? JSON.parse(b.items) : (b.items || []),
      gstEnabled: b.gstEnabled || b['GST Enabled'] || false,
      gstType: b.gstType || b['GST Type'] || 'intra',
      cgstRate: b.cgstRate || b['CGST Rate'] || 0,
      sgstRate: b.sgstRate || b['SGST Rate'] || 0,
      igstRate: b.igstRate || b['IGST Rate'] || 0,
      paymentMethod: b.paymentMethod || b['Payment Method'] || 'Cash',
      notes: b.notes || b.Notes || '',
      showSignature: b.showSignature || b['Show Signature'] || false,
      subtotal: b.subtotal || b.Subtotal || 0,
      cgstAmount: b.cgstAmount || b['CGST Amount'] || 0,
      sgstAmount: b.sgstAmount || b['SGST Amount'] || 0,
      igstAmount: b.igstAmount || b['IGST Amount'] || 0,
      total: b.total || b.Total || 0,
      date: b.date || b.Date || b.createdAt || '',
      createdAt: b.createdAt || b['Created At'] || ''
    }));
  } catch (error) {
    console.error('Error reading bills:', error);
    return [];
  }
};

// Write bills to Excel
const writeBills = async (bills) => {
  try {
    // Convert items array to JSON string for Excel storage
    const billsForExcel = bills.map(bill => ({
      ...bill,
      items: JSON.stringify(bill.items || [])
    }));
    writeSheet(SHEETS.BILLS, billsForExcel);
  } catch (error) {
    console.error('Error writing bills:', error);
    throw error;
  }
};

// Get next bill ID
const getNextBillId = async () => {
  return getNextId(SHEETS.BILLS);
};

module.exports = {
  readBills,
  writeBills,
  getNextBillId
};
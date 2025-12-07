const {
  readBills,
  writeBills,
  getNextBillId
} = require('../utils/billingExcelHandler');

const createBill = async (req, res) => {
  try {
    const {
      buyerName,
      buyerPhone,
      buyerEmail,
      buyerAddress,
      items,
      gstEnabled,
      gstType,
      cgstRate,
      sgstRate,
      igstRate,
      paymentMethod,
      notes,
      showSignature,
      summary
    } = req.body;

    if (!buyerName || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Buyer name and at least one item are required'
      });
    }

    const bills = await readBills();
    const newId = await getNextBillId();

    const newBill = {
      id: newId,
      billNumber: `BILL-${String(newId).padStart(6, '0')}`,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone ? buyerPhone.trim() : '',
      buyerEmail: buyerEmail ? buyerEmail.trim() : '',
      buyerAddress: buyerAddress ? buyerAddress.trim() : '',
      items: items,
      gstEnabled: gstEnabled || false,
      gstType: gstType || 'intra',
      cgstRate: gstEnabled && gstType === 'intra' ? parseFloat(cgstRate || 0) : 0,
      sgstRate: gstEnabled && gstType === 'intra' ? parseFloat(sgstRate || 0) : 0,
      igstRate: gstEnabled && gstType === 'inter' ? parseFloat(igstRate || 0) : 0,
      paymentMethod: paymentMethod || 'Cash',
      notes: notes ? notes.trim() : '',
      showSignature: showSignature || false,
      subtotal: summary.subtotal || 0,
      cgstAmount: summary.cgstAmount || 0,
      sgstAmount: summary.sgstAmount || 0,
      igstAmount: summary.igstAmount || 0,
      total: summary.total || 0,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    bills.push(newBill);
    await writeBills(bills);

    res.json({
      success: true,
      message: 'Bill created successfully',
      data: newBill
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bill'
    });
  }
};

const getAllBills = async (req, res) => {
  try {
    const bills = await readBills();
    res.json({
      success: true,
      data: bills
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bills'
    });
  }
};

const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bills = await readBills();
    const bill = bills.find(b => b.id === parseInt(id));

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bill'
    });
  }
};

const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bills = await readBills();
    const filteredBills = bills.filter(b => b.id !== parseInt(id));

    if (bills.length === filteredBills.length) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    await writeBills(filteredBills);

    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting bill'
    });
  }
};

module.exports = {
  createBill,
  getAllBills,
  getBillById,
  deleteBill
};
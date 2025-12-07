const express = require('express');
const router = express.Router();
const {
  createBill,
  getAllBills,
  getBillById,
  deleteBill
} = require('../controllers/billingController');

// Create new bill
router.post('/', createBill);

// Get all bills
router.get('/', getAllBills);

// Get bill by ID
router.get('/:id', getBillById);

// Delete bill
router.delete('/:id', deleteBill);

module.exports = router;
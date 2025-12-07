const express = require('express');
const router = express.Router();
const {
  getAllOthers,
  getOtherById,
  createOther,
  updateOther,
  deleteOther
} = require('../controllers/otherController');

// Get all other transactions
router.get('/', getAllOthers);

// Get transaction by ID
router.get('/:id', getOtherById);

// Create new transaction
router.post('/', createOther);

// Update transaction
router.put('/:id', updateOther);

// Delete transaction
router.delete('/:id', deleteOther);

module.exports = router;
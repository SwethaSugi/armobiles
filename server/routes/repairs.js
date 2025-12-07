const express = require('express');
const router = express.Router();
const {
  getAllRepairs,
  getRepairById,
  createRepair,
  updateRepair,
  deleteRepair
} = require('../controllers/repairController');

// Get all repairs
router.get('/', getAllRepairs);

// Get repair by ID
router.get('/:id', getRepairById);

// Create new repair
router.post('/', createRepair);

// Update repair
router.put('/:id', updateRepair);

// Delete repair
router.delete('/:id', deleteRepair);

module.exports = router;
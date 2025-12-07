const express = require('express');
const router = express.Router();
const {
  getOtherCategories,
  getOtherCategoryById,
  createOtherCategory,
  updateOtherCategory,
  deleteOtherCategory
} = require('../controllers/otherCategoryController');

// Get all categories
router.get('/', getOtherCategories);

// Get category by ID
router.get('/:id', getOtherCategoryById);

// Create new category
router.post('/', createOtherCategory);

// Update category
router.put('/:id', updateOtherCategory);

// Delete category
router.delete('/:id', deleteOtherCategory);

module.exports = router;
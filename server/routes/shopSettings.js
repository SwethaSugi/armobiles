const express = require('express');
const router = express.Router();
const {
  getShopSettings,
  saveShopSettings
} = require('../controllers/shopSettingsController');

// Get shop settings
router.get('/', getShopSettings);

// Save shop settings
router.post('/', saveShopSettings);

module.exports = router;
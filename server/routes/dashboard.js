const express = require('express');
const router = express.Router();
const { getDashboardStats, getChartData, downloadExcelFile, resetAllData } = require('../controllers/dashboardController');

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get chart data
router.get('/chart-data', getChartData);

// Download Excel file
router.get('/download-excel', downloadExcelFile);

// Reset all data
router.post('/reset-all-data', resetAllData);

module.exports = router;
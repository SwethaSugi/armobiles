const { 
  getTodayRevenue, 
  getTotalRevenue, 
  getPendingServicesCount, 
  getLowStockCount,
  getRevenueChartData 
} = require('../utils/dashboardExcelHandler');

const getDashboardStats = async (req, res) => {
  try {
    const todayRevenue = await getTodayRevenue();
    const totalRevenue = await getTotalRevenue();
    const pendingServices = await getPendingServicesCount();
    const lowStockAlerts = await getLowStockCount();

    res.json({
      success: true,
      data: {
        todayRevenue,
        totalRevenue,
        pendingServices,
        lowStockAlerts
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

const getChartData = async (req, res) => {
  try {
    const { viewType, startDate, endDate } = req.query;
    
    const chartData = await getRevenueChartData(viewType || '30days', startDate, endDate);

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chart data'
    });
  }
};

const downloadExcelFile = async (req, res) => {
  try {
    const path = require('path');
    const fs = require('fs');
    const DATA_DIR = path.join(__dirname, '../data');
    const UNIFIED_FILE = path.join(DATA_DIR, 'data.xlsx');

    if (!fs.existsSync(UNIFIED_FILE)) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Set headers for file download
    const filename = `shop-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    const encodedFilename = encodeURIComponent(filename);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send the file using absolute path
    const absolutePath = path.resolve(UNIFIED_FILE);
    res.sendFile(absolutePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading Excel file'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error downloading Excel file'
      });
    }
  }
};

const resetAllData = async (req, res) => {
  try {
    const { resetAllData: resetFunction } = require('../utils/unifiedExcelHandler');
    
    // Reset all data (keeps Users sheet for login)
    resetFunction();
    
    res.json({
      success: true,
      message: 'All data has been reset successfully. Users data preserved for login.'
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting data. Please ensure data.xlsx is not open in another program.'
    });
  }
};

module.exports = {
  getDashboardStats,
  getChartData,
  downloadExcelFile,
  resetAllData
};
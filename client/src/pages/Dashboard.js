import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Navigation from '../components/Navigation';
import axios from 'axios';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [viewType, setViewType] = useState('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    totalRevenue: 0,
    pendingServices: 0,
    lowStockAlerts: 0
  });
  const [chartData, setChartData] = useState({
    labels: [],
    data: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchChartData();
  }, [viewType, startDate, endDate]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      let url = `/api/dashboard/chart-data?viewType=${viewType}`;
      if (viewType === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setChartData({
          labels: response.data.data.labels || [],
          data: response.data.data.data || []
        });
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const toggleCustomDates = () => {
    // This is handled by the viewType state
  };

  const handleViewTypeChange = (e) => {
    setViewType(e.target.value);
    if (e.target.value !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchChartData();
  };

  const resetFilter = () => {
    setViewType('30days');
    setStartDate('');
    setEndDate('');
  };

  const getChartTitle = () => {
    switch (viewType) {
      case '7days':
        return '📈 Overall Revenue Trend (Last 7 Days)';
      case '30days':
        return '📈 Overall Revenue Trend (Last 30 Days)';
      case 'month':
        return '📈 Overall Revenue Trend (Month-wise - Last 12 Months)';
      case 'custom':
        return '📈 Overall Revenue Trend (Custom Range)';
      default:
        return '📈 Overall Revenue Trend';
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Revenue: ₹' + context.parsed.y.toLocaleString('en-IN');
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  };

  const chartDataConfig = {
    labels: chartData.labels.length > 0 ? chartData.labels : ['No Data'],
    datasets: [
      {
        label: 'Overall Revenue (₹)',
        data: chartData.data.length > 0 ? chartData.data : [0],
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
        pointHoverRadius: 6
      }
    ]
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get('/api/dashboard/download-excel', {
        responseType: 'blob'
      });

      // Create blob from response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shop-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  const handleResetAllData = async () => {
    // Confirmation dialog
    const confirmMessage = 
      '⚠️ WARNING: This will delete ALL data from the Excel file!\n\n' +
      'This action will:\n' +
      '• Download the current Excel file to your computer first\n' +
      '• Delete all products, categories, repairs, bills, sales, shop settings, and other transactions\n' +
      '• Keep only user accounts (for login)\n\n' +
      'Are you sure you want to proceed?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Step 1: Download Excel file first
      try {
        const downloadResponse = await axios.get('/api/dashboard/download-excel', {
          responseType: 'blob'
        });

        // Create blob from response
        const blob = new Blob([downloadResponse.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `shop-data-backup-${timestamp}.xlsx`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Wait a moment for download to start
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (downloadError) {
        console.error('Error downloading backup:', downloadError);
        const proceed = window.confirm(
          'Failed to download backup file. Do you still want to proceed with reset?\n\n' +
          '⚠️ Your data will be lost if you continue!'
        );
        if (!proceed) {
          return;
        }
      }

      // Step 2: Final confirmation
      const finalConfirm = window.confirm(
        '📥 Backup downloaded (if successful).\n\n' +
        '⚠️ Last chance to cancel!\n\n' +
        'Click OK to proceed with resetting all data...'
      );

      if (!finalConfirm) {
        return;
      }

      // Step 3: Reset all data
      const response = await axios.post('/api/dashboard/reset-all-data');
      
      if (response.data.success) {
        alert('✅ Success!\n\nAll data has been reset successfully.\n\n' +
              '• Backup file has been downloaded\n' +
              '• All data sheets have been cleared\n' +
              '• User accounts preserved for login\n\n' +
              'The page will now refresh to show the updated dashboard.');
        
        // Refresh dashboard data
        fetchDashboardData();
        fetchChartData();
      } else {
        throw new Error(response.data.message || 'Failed to reset data');
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error resetting data';
      alert(`❌ Error: ${errorMessage}\n\nPlease ensure data.xlsx is not open in Excel or another program.`);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navigation />
      <div className="dashboard-container">
        <div className="dashboard-content-wrapper">
          <div className="dashboard-header">
            <h2 className="dashboard-title">📊 Dashboard</h2>
            <div className="dashboard-actions">
              <button
                className="btn btn-download"
                onClick={handleDownloadExcel}
                title="Download all data as Excel file"
              >
                📥 Download Excel
              </button>
              <button
                className="btn btn-reset"
                onClick={handleResetAllData}
                title="Reset all data (downloads backup first)"
              >
                🔄 Reset All Data
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="filter-card">
            <form onSubmit={handleSubmit}>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <label className="form-label">📅 View Revenue By:</label>
                  <select
                    className="form-select"
                    value={viewType}
                    onChange={handleViewTypeChange}
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="month">Month-wise (Last 12 Months)</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>
                {viewType === 'custom' && (
                  <>
                    <div className="filter-form-group">
                      <label className="form-label">Start Date:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="filter-form-group">
                      <label className="form-label">End Date:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="filter-form-actions">
                  <button type="submit" className="btn btn-primary">
                    📊 Update View
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetFilter}
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* KPI Cards */}
          <div className="dashboard-grid">
            <div className="stat-card bg-gradient-success">
              <h3>₹{formatCurrency(dashboardData.todayRevenue)}</h3>
              <p>💰 Today's Total Revenue</p>
              <small>All 4 revenue streams</small>
            </div>
            <div className="stat-card bg-gradient-primary">
              <h3>₹{formatCurrency(dashboardData.totalRevenue)}</h3>
              <p>💎 Total Revenue</p>
              <small>Products+Services+Xerox+Others</small>
            </div>
            <div className="stat-card bg-gradient-warning">
              <h3>{dashboardData.pendingServices}</h3>
              <p>🔧 Pending Services</p>
              <small>Repair jobs in queue</small>
            </div>
            <div className="stat-card bg-gradient-danger">
              <h3>{dashboardData.lowStockAlerts}</h3>
              <p>⚠️ Low Stock Alerts</p>
              <small>Products with ≤5 units</small>
            </div>
          </div>

          {/* Charts Row */}
          <div className="chart-container">
            <h5 className="chart-title">{getChartTitle()}</h5>
            {loading ? (
              <div className="chart-loading">Loading chart data...</div>
            ) : (
              <div className="chart-wrapper">
                <Line data={chartDataConfig} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
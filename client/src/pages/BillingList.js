import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';
import './BillingList.css';

const BillingList = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bills, filters]);

  const fetchBills = async () => {
    try {
      const response = await axios.get('/api/billing');
      if (response.data.success) {
        setBills(response.data.data);
        setFilteredBills(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bills];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(bill =>
        bill.buyerName?.toLowerCase().includes(searchLower) ||
        bill.buyerPhone?.includes(filters.search) ||
        bill.billNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(bill => {
        const billDate = bill.date || bill.createdAt?.split('T')[0];
        return billDate >= filters.startDate;
      });
    }

    if (filters.endDate) {
      filtered = filtered.filter(bill => {
        const billDate = bill.date || bill.createdAt?.split('T')[0];
        return billDate <= filters.endDate;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0);
      const dateB = new Date(b.date || b.createdAt || 0);
      return dateB - dateA;
    });

    setFilteredBills(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await axios.delete(`/api/billing/${id}`);
        fetchBills();
      } catch (error) {
        console.error('Error deleting bill:', error);
        alert('Error deleting bill. Please try again.');
      }
    }
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getItemsCount = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const getGSTDisplay = (bill) => {
    if (!bill.gstEnabled) return 'No';
    if (bill.gstType === 'intra') {
      return `CGST: ${bill.cgstRate}% + SGST: ${bill.sgstRate}%`;
    } else {
      return `IGST: ${bill.igstRate}%`;
    }
  };

  const getGSTAmount = (bill) => {
    if (!bill.gstEnabled) return 0;
    return (bill.cgstAmount || 0) + (bill.sgstAmount || 0) + (bill.igstAmount || 0);
  };

  return (
    <div className="billing-list-wrapper">
      <Navigation />
      <div className="billing-list-container">
        <div className="billing-list-content-wrapper">
          <div className="billing-list-header">
            <h2 className="billing-list-title">📋 Bills History</h2>
            <button
              className="btn btn-success"
              onClick={() => navigate('/billing')}
            >
              ➕ Create New Bill
            </button>
          </div>

          <div className="content-card">
            {/* Search Filters */}
            <div className="filters-section">
              <h5 className="filters-title">🔍 Search & Filter Bills</h5>
              <div className="filters-grid">
                <div className="filter-group search-group">
                  <label htmlFor="search" className="form-label">
                    🔎 Search
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="search"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Customer name, phone, or bill number..."
                  />
                  <small className="form-text">
                    Search by buyer name, phone number, or bill number
                  </small>
                </div>
                <div className="filter-group date-group">
                  <label htmlFor="startDate" className="form-label">
                    📅 From Date
                  </label>
                  <input
                    type="date"
                    className="form-control date-input"
                    id="startDate"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div className="filter-group date-group">
                  <label htmlFor="endDate" className="form-label">
                    📅 To Date
                  </label>
                  <input
                    type="date"
                    className="form-control date-input"
                    id="endDate"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div className="filter-actions">
                  <button
                    type="button"
                    className="btn btn-primary w-100 mb-2"
                    onClick={applyFilters}
                  >
                    🔍 Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 btn-sm"
                    onClick={clearFilters}
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="results-summary">
              <strong>📊 Found {filteredBills.length} bill(s)</strong>
            </div>

            {/* Bills Table */}
            {loading ? (
              <div className="loading-message">Loading bills...</div>
            ) : filteredBills.length === 0 ? (
              <div className="empty-message">
                <h5>📄 No bills found</h5>
                <p>Create your first bill to get started</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/billing')}
                >
                  Create Bill
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="bills-table">
                  <thead>
                    <tr>
                      <th>Bill No.</th>
                      <th>Date</th>
                      <th>Buyer Name</th>
                      <th>Contact</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>GST</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr key={bill.id}>
                        <td className="bill-number">
                          <strong>{bill.billNumber || `BILL-${String(bill.id).padStart(6, '0')}`}</strong>
                        </td>
                        <td className="bill-date">{formatDate(bill.date || bill.createdAt)}</td>
                        <td className="buyer-name">{bill.buyerName}</td>
                        <td className="buyer-contact">
                          {bill.buyerPhone || <span className="text-muted">-</span>}
                        </td>
                        <td className="items-count">
                          <span className="items-badge">{getItemsCount(bill.items)} items</span>
                        </td>
                        <td className="bill-amount">
                          <strong className="amount-value">₹{formatCurrency(bill.total)}</strong>
                          <small className="subtotal-text">Sub: ₹{formatCurrency(bill.subtotal)}</small>
                        </td>
                        <td className="gst-info">
                          {bill.gstEnabled ? (
                            <div>
                              <div className="gst-label">{getGSTDisplay(bill)}</div>
                              <div className="gst-amount">₹{formatCurrency(getGSTAmount(bill))}</div>
                            </div>
                          ) : (
                            <span className="text-muted">No GST</span>
                          )}
                        </td>
                        <td>
                          <span className={`payment-badge payment-${bill.paymentMethod?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {bill.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon btn-view"
                              onClick={() => navigate(`/billing/view/${bill.id}`)}
                              title="View Bill"
                            >
                              👁️
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => handleDelete(bill.id)}
                              title="Delete Bill"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingList;
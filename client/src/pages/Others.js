import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import axios from 'axios';
import './Others.css';

const Others = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    customerName: '',
    amount: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  useEffect(() => {
    calculateStats();
    filterTransactions();
  }, [transactions, searchTerm, categoryFilter]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/others');
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/other-categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const total = transactions.reduce((sum, t) => {
      return sum + parseFloat(t.amount || 0);
    }, 0);

    const todayTotal = transactions
      .filter(t => {
        const transactionDate = t.date || t.createdAt?.split('T')[0];
        return transactionDate === today;
      })
      .reduce((sum, t) => {
        return sum + parseFloat(t.amount || 0);
      }, 0);

    setStats({
      totalRevenue: total,
      todayRevenue: todayTotal
    });
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by category
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(searchLower) ||
        t.customerName?.toLowerCase().includes(searchLower) ||
        t.category?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0);
      const dateB = new Date(b.date || b.createdAt || 0);
      return dateB - dateA;
    });

    return filtered;
  };

  const filteredTransactions = filterTransactions();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update transaction
        await axios.put(`/api/others/${editingId}`, formData);
      } else {
        // Add new transaction
        await axios.post('/api/others', formData);
      }
      setFormData({
        category: '',
        description: '',
        customerName: '',
        amount: '',
        notes: ''
      });
      setEditingId(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert(error.response?.data?.message || 'Error saving transaction. Please try again.');
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      category: transaction.category || '',
      description: transaction.description || '',
      customerName: transaction.customerName || '',
      amount: transaction.amount || '',
      notes: transaction.notes || ''
    });
    setEditingId(transaction.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/others/${id}`);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
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

  return (
    <div className="others-wrapper">
      <Navigation />
      <div className="others-container">
        <div className="others-content-wrapper">
          <div className="others-header">
            <div>
              <h2 className="others-title">💼 Other Revenue</h2>
              <p className="others-subtitle">
                Track miscellaneous revenue like recharges, bill payments, money transfers, etc.
              </p>
            </div>
          </div>

          {/* Statistics Row */}
          <div className="stats-row">
            <div className="stat-box stat-total">
              <h4>₹{formatCurrency(stats.totalRevenue)}</h4>
              <p>Total Other Revenue</p>
            </div>
            <div className="stat-box stat-today">
              <h4>₹{formatCurrency(stats.todayRevenue)}</h4>
              <p>Today's Other Revenue</p>
            </div>
          </div>

          <div className="others-layout">
            {/* Add/Edit Form */}
            <div className="others-form-card">
              <h4 className="form-card-title">
                {editingId ? '✏️ Edit Transaction' : '➕ New Transaction'}
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => {
                      const categoryName = typeof cat === 'string' ? cat : (cat.name || cat);
                      return (
                        <option key={categoryName} value={categoryName}>{categoryName}</option>
                      );
                    })}
                  </select>
                  <small className="form-text">
                    <a href="/other-categories" target="_blank" rel="noopener noreferrer">
                      Manage Categories
                    </a>
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="E.g., Airtel Recharge for 9876543210"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customerName" className="form-label">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    Amount (₹) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="amount"
                    name="amount"
                    min="0"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes" className="form-label">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="2"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="form-actions">
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          category: '',
                          description: '',
                          customerName: '',
                          amount: '',
                          notes: ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Transaction' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </div>

            {/* Transactions List */}
            <div className="others-list-card">
              <div className="list-header">
                <h4 className="list-title">📋 Transaction History</h4>
                <div className="list-controls">
                  <select
                    className="form-select category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    {categories.map(cat => {
                      const categoryName = typeof cat === 'string' ? cat : (cat.name || cat);
                      return (
                        <option key={categoryName} value={categoryName}>{categoryName}</option>
                      );
                    })}
                  </select>
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="🔍 Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="loading-message">Loading transactions...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="empty-message">
                  {transactions.length === 0
                    ? 'No transactions yet. Add your first transaction!'
                    : 'No transactions match your search criteria.'}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="others-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="transaction-date">{formatDate(transaction.date || transaction.createdAt)}</td>
                          <td>
                            <span className="category-badge">{transaction.category}</span>
                          </td>
                          <td className="description-cell">{transaction.description}</td>
                          <td className="customer-cell">
                            {transaction.customerName || <span className="text-muted">-</span>}
                          </td>
                          <td className="amount-cell">
                            <strong>₹{formatCurrency(transaction.amount)}</strong>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon btn-edit"
                                onClick={() => handleEdit(transaction)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={() => handleDelete(transaction.id)}
                                title="Delete"
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
    </div>
  );
};

export default Others;
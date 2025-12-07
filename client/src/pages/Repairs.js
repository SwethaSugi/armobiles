import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import axios from 'axios';
import './Repairs.css';

const Repairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceName: '',
    issue: '',
    estimatedCost: '',
    status: 'Pending',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      const response = await axios.get('/api/repairs');
      if (response.data.success) {
        setRepairs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normalize status for consistent comparison
  const normalizeStatus = (status) => {
    if (!status) return '';
    return status.trim();
  };

  const filterAndSortRepairs = () => {
    let filtered = [...repairs];

    // Filter by status (case-insensitive)
    if (statusFilter !== 'All') {
      filtered = filtered.filter(r => {
        const repairStatus = normalizeStatus(r.status);
        return repairStatus.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.customerName?.toLowerCase().includes(searchLower) ||
        r.deviceName?.toLowerCase().includes(searchLower) ||
        r.issue?.toLowerCase().includes(searchLower) ||
        r.customerPhone?.includes(searchTerm)
      );
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          const dateA = new Date(a.date || a.createdAt || 0);
          const dateB = new Date(b.date || b.createdAt || 0);
          return dateB - dateA; // Newest first
        case 'date-asc':
          const dateA2 = new Date(a.date || a.createdAt || 0);
          const dateB2 = new Date(b.date || b.createdAt || 0);
          return dateA2 - dateB2; // Oldest first
        case 'status':
          const statusA = normalizeStatus(a.status || '').toLowerCase();
          const statusB = normalizeStatus(b.status || '').toLowerCase();
          if (statusA !== statusB) {
            return statusA.localeCompare(statusB);
          }
          // If status is same, sort by date (newest first)
          const dateA3 = new Date(a.date || a.createdAt || 0);
          const dateB3 = new Date(b.date || b.createdAt || 0);
          return dateB3 - dateA3;
        case 'customer':
          const nameA = (a.customerName || '').toLowerCase();
          const nameB = (b.customerName || '').toLowerCase();
          if (nameA !== nameB) {
            return nameA.localeCompare(nameB);
          }
          // If name is same, sort by date (newest first)
          const dateA4 = new Date(a.date || a.createdAt || 0);
          const dateB4 = new Date(b.date || b.createdAt || 0);
          return dateB4 - dateA4;
        case 'cost-desc':
          const costA = parseFloat(a.estimatedCost || a.amount || 0);
          const costB = parseFloat(b.estimatedCost || b.amount || 0);
          if (costB !== costA) {
            return costB - costA; // Highest first
          }
          // If cost is same, sort by date (newest first)
          const dateA5 = new Date(a.date || a.createdAt || 0);
          const dateB5 = new Date(b.date || b.createdAt || 0);
          return dateB5 - dateA5;
        case 'cost-asc':
          const costA2 = parseFloat(a.estimatedCost || a.amount || 0);
          const costB2 = parseFloat(b.estimatedCost || b.amount || 0);
          if (costA2 !== costB2) {
            return costA2 - costB2; // Lowest first
          }
          // If cost is same, sort by date (newest first)
          const dateA6 = new Date(a.date || a.createdAt || 0);
          const dateB6 = new Date(b.date || b.createdAt || 0);
          return dateB6 - dateA6;
        default:
          return 0;
      }
    });

    return filtered;
  };

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
        // Update repair
        await axios.put(`/api/repairs/${editingId}`, formData);
      } else {
        // Add new repair
        await axios.post('/api/repairs', formData);
      }
      setFormData({
        customerName: '',
        customerPhone: '',
        deviceName: '',
        issue: '',
        estimatedCost: '',
        status: 'Pending',
        notes: ''
      });
      setEditingId(null);
      fetchRepairs();
    } catch (error) {
      console.error('Error saving repair:', error);
      alert(error.response?.data?.message || 'Error saving service entry. Please try again.');
    }
  };

  const handleEdit = (repair) => {
    setFormData({
      customerName: repair.customerName || '',
      customerPhone: repair.customerPhone || '',
      deviceName: repair.deviceName || '',
      issue: repair.issue || '',
      estimatedCost: repair.estimatedCost || repair.amount || '',
      status: repair.status || 'Pending',
      notes: repair.notes || ''
    });
    setEditingId(repair.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service entry?')) {
      try {
        await axios.delete(`/api/repairs/${id}`);
        fetchRepairs();
      } catch (error) {
        console.error('Error deleting repair:', error);
        alert('Error deleting service entry. Please try again.');
      }
    }
  };

  const filteredRepairs = filterAndSortRepairs();

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

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = normalizeStatus(status).toLowerCase();
    switch (normalizedStatus) {
      case 'completed':
      case 'delivered':
        return 'status-completed';
      case 'in progress':
      case 'in-progress':
      case 'progress':
        return 'status-progress';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="repairs-wrapper">
      <Navigation />
      <div className="repairs-container">
        <div className="repairs-content-wrapper">
          <h2 className="repairs-title">🔧 Service / Repair Log</h2>

          <div className="repairs-layout">
            {/* Add/Edit Form */}
            <div className="repair-form-card">
              <h4 className="form-card-title">
                {editingId ? '✏️ Edit Service Entry' : '➕ New Service Entry'}
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="customerName" className="form-label">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customerPhone" className="form-label">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="deviceName" className="form-label">
                    Device/Item
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="deviceName"
                    name="deviceName"
                    value={formData.deviceName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., iPhone 12, Samsung TV"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="issue" className="form-label">
                    Issue / Service Required
                  </label>
                  <textarea
                    className="form-control"
                    id="issue"
                    name="issue"
                    rows="3"
                    value={formData.issue}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe the issue or service required..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedCost" className="form-label">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="estimatedCost"
                    name="estimatedCost"
                    min="0"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delivered">Delivered</option>
                  </select>
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
                    maxLength="500"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional details or comments..."
                  />
                  <small className="form-text">Max 500 characters</small>
                </div>

                <div className="form-actions">
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          customerName: '',
                          customerPhone: '',
                          deviceName: '',
                          issue: '',
                          estimatedCost: '',
                          status: 'Pending',
                          notes: ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Entry' : 'Add Entry'}
                  </button>
                </div>
              </form>
            </div>

            {/* Service Entries List */}
            <div className="repair-list-card">
              <div className="list-header">
                <h4 className="list-title">📋 Service Entries</h4>
                <div className="list-controls">
                  <select
                    className="form-select status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <select
                    className="form-select sort-filter"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date-desc">📅 Date (Newest)</option>
                    <option value="date-asc">📅 Date (Oldest)</option>
                    <option value="status">🏷️ Status</option>
                    <option value="customer">👤 Customer Name</option>
                    <option value="cost-desc">💰 Cost (High to Low)</option>
                    <option value="cost-asc">💰 Cost (Low to High)</option>
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
                <div className="loading-message">Loading service entries...</div>
              ) : filteredRepairs.length === 0 ? (
                <div className="empty-message">
                  {repairs.length === 0
                    ? 'No service entries found. Add your first entry!'
                    : 'No entries match your search criteria.'}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="repairs-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Device</th>
                        <th>Issue</th>
                        <th>Cost (₹)</th>
                        <th>Status</th>
                        <th>Notes</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRepairs.map((repair) => (
                        <tr key={repair.id}>
                          <td>{repair.id}</td>
                          <td className="customer-name">{repair.customerName || repair.customer}</td>
                          <td>{repair.customerPhone || '-'}</td>
                          <td className="device-name">{repair.deviceName || repair.device}</td>
                          <td className="issue-cell">
                            {repair.issue ? (
                              <span title={repair.issue}>
                                {repair.issue.length > 30
                                  ? repair.issue.substring(0, 30) + '...'
                                  : repair.issue}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="cost-cell">₹{formatCurrency(repair.estimatedCost || repair.amount)}</td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(repair.status)}`}>
                              {repair.status}
                            </span>
                          </td>
                          <td className="notes-cell">
                            {repair.notes ? (
                              <span title={repair.notes}>
                                {repair.notes.length > 20
                                  ? repair.notes.substring(0, 20) + '...'
                                  : repair.notes}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="date-cell">{formatDate(repair.date || repair.createdAt)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon btn-edit"
                                onClick={() => handleEdit(repair)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={() => handleDelete(repair.id)}
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

export default Repairs;
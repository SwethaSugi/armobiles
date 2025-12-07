import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import axios from 'axios';
import './Categories.css';

const OtherCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/other-categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
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
        await axios.put(`/api/other-categories/${editingId}`, formData);
      } else {
        await axios.post('/api/other-categories', formData);
      }
      setFormData({
        name: '',
        description: ''
      });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.message || 'Error saving category. Please try again.');
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name || category,
      description: category.description || ''
    });
    setEditingId(category.id || category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? Transactions using this category will need to be updated!')) {
      try {
        await axios.delete(`/api/other-categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(error.response?.data?.message || 'Error deleting category. Please try again.');
      }
    }
  };

  const filteredCategories = categories.filter(cat => {
    const categoryName = typeof cat === 'string' ? cat : (cat.name || '');
    return categoryName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="categories-wrapper">
      <Navigation />
      <div className="categories-container">
        <div className="categories-content-wrapper">
          <div className="other-categories-header">
            <h2 className="categories-title">🏷️ Manage Other Revenue Categories</h2>
            <p className="categories-subtitle">
              Create custom categories for your miscellaneous revenue transactions
            </p>
          </div>

          <div className="categories-layout">
            <div className="category-form-section">
              <div className="category-form-card">
                <h4 className="form-card-title">
                  {editingId ? '✏️ Edit Category' : '➕ Add New Category'}
                </h4>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Category Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="E.g., Mobile Recharge, Bill Payment"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      Description (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="E.g., For mobile recharge transactions"
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
                            name: '',
                            description: ''
                          });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary">
                      {editingId ? 'Update Category' : 'Add Category'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Add Default Categories */}
              <div className="quick-add-card">
                <h5 className="quick-add-title">💡 Common Categories</h5>
                <p className="quick-add-subtitle">
                  Click to quickly add common categories:
                </p>
                <div className="quick-add-buttons">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setFormData({
                        name: 'Mobile Recharge',
                        description: 'For mobile recharge transactions'
                      });
                      document.getElementById('name')?.focus();
                    }}
                  >
                    Mobile Recharge
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setFormData({
                        name: 'Bill Payment',
                        description: 'For EB, water, gas bill payments'
                      });
                      document.getElementById('name')?.focus();
                    }}
                  >
                    Bill Payment
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setFormData({
                        name: 'Money Transfer',
                        description: 'For money transfer services'
                      });
                      document.getElementById('name')?.focus();
                    }}
                  >
                    Money Transfer
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setFormData({
                        name: 'DTH Recharge',
                        description: 'For DTH recharge transactions'
                      });
                      document.getElementById('name')?.focus();
                    }}
                  >
                    DTH Recharge
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setFormData({
                        name: 'Commission',
                        description: 'For commission income'
                      });
                      document.getElementById('name')?.focus();
                    }}
                  >
                    Commission
                  </button>
                </div>
              </div>
            </div>

            <div className="category-list-card">
              <h4 className="list-title">📋 Your Categories</h4>

              {loading ? (
                <div className="loading-message">Loading categories...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="empty-message">
                  {categories.length === 0
                    ? 'No categories yet. Add your first category using the form on the left!'
                    : 'No categories match your search criteria.'}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="categories-table">
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((category, index) => {
                        const categoryId = typeof category === 'object' ? category.id : index + 1;
                        const categoryName = typeof category === 'string' ? category : (category.name || '');
                        const categoryDesc = typeof category === 'object' ? (category.description || '') : '';

                        return (
                          <tr key={categoryId}>
                            <td>
                              <span className="category-badge">
                                {categoryName}
                              </span>
                            </td>
                            <td className="description-cell">
                              {categoryDesc ? (
                                <span title={categoryDesc}>
                                  {categoryDesc}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-icon btn-edit"
                                  onClick={() => handleEdit(category)}
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn-icon btn-delete"
                                  onClick={() => handleDelete(categoryId)}
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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

export default OtherCategories;
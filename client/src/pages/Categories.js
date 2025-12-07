import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import axios from 'axios';
import './Categories.css';

const Categories = () => {
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
      const response = await axios.get('/api/categories');
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
        // Update category
        await axios.put(`/api/categories/${editingId}`, formData);
      } else {
        // Add new category
        await axios.post('/api/categories', formData);
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
    if (window.confirm('Are you sure? Products using this category will need to be updated!')) {
      try {
        await axios.delete(`/api/categories/${id}`);
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
          <h2 className="categories-title">🏷️ Manage Categories</h2>

          <div className="categories-layout">
            {/* Add/Edit Category Form */}
            <div className="category-form-section">
              <div className="category-form-card">
                <h4 className="form-card-title">
                  {editingId ? '✏️ Edit Category' : '➕ Add New Category'}
                </h4>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Category Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Electronics, Clothing, Food"
                    />
                    <small className="form-text">
                      e.g., Electronics, Clothing, Food, etc.
                    </small>
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
                      placeholder="Add a description for this category..."
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

              {/* Quick Tips Card */}
              <div className="tips-card">
                <h6 className="tips-title">💡 Quick Tips</h6>
                <ul className="tips-list">
                  <li>Create categories that match your shop's inventory</li>
                  <li>Keep category names simple and clear</li>
                  <li>Categories help organize products better</li>
                  <li>You can edit or delete categories anytime</li>
                </ul>
              </div>
            </div>

            {/* Categories List */}
            <div className="category-list-card">
              <div className="list-header">
                <h4 className="list-title">📋 Categories List</h4>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="🔍 Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="loading-message">Loading categories...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="empty-message">
                  {categories.length === 0
                    ? 'No categories found. Add your first category!'
                    : 'No categories match your search criteria.'}
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="categories-table">
                      <thead>
                        <tr>
                          <th>ID</th>
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
                              <td>{categoryId}</td>
                              <td>
                                <span className="category-badge">
                                  {categoryName}
                                </span>
                              </td>
                              <td className="description-cell">
                                {categoryDesc ? (
                                  <span title={categoryDesc}>
                                    {categoryDesc.length > 50
                                      ? categoryDesc.substring(0, 50) + '...'
                                      : categoryDesc}
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

                  <div className="info-alert">
                    <strong>ℹ️ Note:</strong> These categories will be available when adding or editing products.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    buyPrice: '',
    sellPrice: '',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceVisibility, setPriceVisibility] = useState({});
  const [allPricesVisible, setAllPricesVisible] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      if (response.data.success) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
        // Initialize price visibility
        const visibility = {};
        response.data.data.forEach(product => {
          visibility[product.id] = true;
        });
        setPriceVisibility(visibility);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
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
        // Update product
        await axios.put(`/api/products/${editingId}`, formData);
      } else {
        // Add new product
        await axios.post('/api/products', formData);
      }
      setFormData({
        name: '',
        category: '',
        quantity: '',
        buyPrice: '',
        sellPrice: '',
        notes: ''
      });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      notes: product.notes || ''
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const togglePriceVisibility = (id) => {
    setPriceVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleAllPrices = () => {
    const newVisibility = !allPricesVisible;
    setAllPricesVisible(newVisibility);
    const visibility = {};
    products.forEach(product => {
      visibility[product.id] = newVisibility;
    });
    setPriceVisibility(visibility);
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="products-wrapper">
      <Navigation />
      <div className="products-container">
        <div className="products-content-wrapper">
          <h2 className="products-title">📦 Product Management</h2>

          <div className="products-layout">
            {/* Add/Edit Product Form */}
            <div className="product-form-card">
              <h4 className="form-card-title">
                {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category
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
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => navigate('/categories')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#667eea',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                        fontSize: '0.85rem',
                        fontFamily: 'inherit'
                      }}
                    >
                      + Add new category
                    </button>
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity"
                    name="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="buyPrice" className="form-label">
                    Buy Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="buyPrice"
                    name="buyPrice"
                    min="0"
                    value={formData.buyPrice}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sellPrice" className="form-label">
                    Sell Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="sellPrice"
                    name="sellPrice"
                    min="0"
                    value={formData.sellPrice}
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
                    rows="3"
                    maxLength="500"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional information..."
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
                          name: '',
                          category: '',
                          quantity: '',
                          buyPrice: '',
                          sellPrice: '',
                          notes: ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>

            {/* Product List */}
            <div className="product-list-card">
              <div className="list-header">
                <h4 className="list-title">📋 Product List</h4>
                <div className="list-controls">
                  <select
                    className="form-select category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="All">📂 All Categories</option>
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
                    placeholder="🔍 Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="loading-message">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty-message">
                  {products.length === 0
                    ? 'No products found. Add your first product!'
                    : 'No products match your search criteria.'}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Buy Price</th>
                        <th>
                          Sell Price
                          <span
                            className="eye-icon"
                            onClick={toggleAllPrices}
                            title="Toggle all prices"
                          >
                            {allPricesVisible ? '👁️' : '🙈'}
                          </span>
                        </th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td>{product.id}</td>
                          <td className="product-name">{product.name}</td>
                          <td>
                            <span className="category-badge">{product.category}</span>
                          </td>
                          <td>
                            <span className={`quantity-badge ${product.quantity <= 5 ? 'low-stock' : ''}`}>
                              {product.quantity}
                            </span>
                          </td>
                          <td>₹{formatCurrency(product.buyPrice)}</td>
                          <td className="price-cell">
                            <span
                              className={priceVisibility[product.id] ? '' : 'price-hidden'}
                              onClick={() => togglePriceVisibility(product.id)}
                            >
                              ₹{formatCurrency(product.sellPrice)}
                            </span>
                          </td>
                          <td className="notes-cell">
                            {product.notes ? (
                              <span title={product.notes}>
                                {product.notes.length > 30
                                  ? product.notes.substring(0, 30) + '...'
                                  : product.notes}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon btn-edit"
                                onClick={() => handleEdit(product)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={() => handleDelete(product.id)}
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

export default Products;
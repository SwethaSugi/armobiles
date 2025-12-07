import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';
import './Billing.css';

const Billing = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [shopSettings, setShopSettings] = useState({
    shopName: 'AR MOBILES AND AR ESEVAI',
    shopPhone: '8144476803',
    shopGstin: ''
  });
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    buyerAddress: '',
    gstEnabled: false,
    gstType: 'intra',
    cgstRate: 9.0,
    sgstRate: 9.0,
    igstRate: 18.0,
    paymentMethod: 'Cash',
    notes: '',
    showSignature: false
  });
  const [customItem, setCustomItem] = useState({
    name: '',
    quantity: 1,
    price: ''
  });

  useEffect(() => {
    loadItems();
    fetchShopSettings();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  const fetchShopSettings = async () => {
    try {
      const response = await axios.get('/api/shop-settings');
      if (response.data.success && response.data.data) {
        setShopSettings({
          shopName: response.data.data.shopName || 'AR MOBILES AND AR ESEVAI',
          shopPhone: response.data.data.shopPhone || '8144476803',
          shopGstin: response.data.data.shopGstin || ''
        });
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
    }
  };

  const loadItems = async () => {
    try {
      const [productsRes, servicesRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/repairs')
      ]);

      const productsData = productsRes.data.success ? productsRes.data.data : [];
      const servicesData = servicesRes.data.success ? servicesRes.data.data : [];

      setProducts(productsData);
      setServices(servicesData);

      // Combine all items
      const combined = [
        ...productsData.map(p => ({
          id: `P_${p.id}`,
          actualId: p.id,
          type: 'product',
          name: p.name,
          quantity: p.quantity,
          price: p.sellPrice,
          displayInfo: `Stock: ${p.quantity} | Price: ₹${parseFloat(p.sellPrice || 0).toFixed(2)}`
        })),
        ...servicesData.map(s => ({
          id: `S_${s.id}`,
          actualId: s.id,
          type: 'service',
          name: `Service: ${s.deviceName || s.device} - ${s.customerName || s.customer}`,
          description: s.issue,
          quantity: 1,
          price: s.estimatedCost || s.amount,
          displayInfo: `Service Entry | Cost: ₹${parseFloat(s.estimatedCost || s.amount || 0).toFixed(2)}`
        }))
      ];

      setAllItems(combined);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const filteredItems = allItems.filter(item => {
    if (!searchTerm) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))) &&
      !selectedProducts.find(sp => sp.id === item.id)
    );
  });

  const selectProduct = (itemId) => {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    setSelectedProducts(prev => [...prev, {
      id: item.id,
      actualId: item.actualId,
      type: item.type,
      name: item.name,
      maxStock: item.type === 'product' ? item.quantity : 9999,
      price: item.price,
      quantity: 1
    }]);

    setSearchTerm('');
    setShowSearchResults(false);
  };

  const removeProduct = (index) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const updateProductQuantity = (index, quantity) => {
    const qty = parseInt(quantity) || 0;
    setSelectedProducts(prev => prev.map((p, i) =>
      i === index ? { ...p, quantity: Math.min(qty, p.maxStock) } : p
    ));
  };

  const updateProductPrice = (index, price) => {
    const priceVal = parseFloat(price) || 0;
    setSelectedProducts(prev => prev.map((p, i) =>
      i === index ? { ...p, price: priceVal } : p
    ));
  };

  const addCustomItem = () => {
    if (!customItem.name.trim()) {
      alert('Please enter item name');
      return;
    }
    if (!customItem.price || parseFloat(customItem.price) <= 0) {
      alert('Please enter a valid price');
      return;
    }
    if (!customItem.quantity || parseInt(customItem.quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setSelectedProducts(prev => [...prev, {
      id: `CUSTOM_${Date.now()}`,
      actualId: 0,
      type: 'custom',
      name: customItem.name,
      maxStock: 9999,
      price: parseFloat(customItem.price),
      quantity: parseInt(customItem.quantity)
    }]);

    setCustomItem({ name: '', quantity: 1, price: '' });
  };

  const calculateBill = () => {
    let subtotal = 0;
    const validProducts = selectedProducts.filter(p => p.quantity > 0);
    
    validProducts.forEach(product => {
      subtotal += product.quantity * product.price;
    });

    let total = subtotal;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (formData.gstEnabled && subtotal > 0) {
      if (formData.gstType === 'intra') {
        cgstAmount = (subtotal * formData.cgstRate) / 100;
        sgstAmount = (subtotal * formData.sgstRate) / 100;
        total += cgstAmount + sgstAmount;
      } else {
        igstAmount = (subtotal * formData.igstRate) / 100;
        total += igstAmount;
      }
    }

    return {
      itemCount: validProducts.length,
      totalQuantity: validProducts.reduce((sum, p) => sum + p.quantity, 0),
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      total
    };
  };

  const billSummary = calculateBill();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.buyerName.trim()) {
      alert('Please enter buyer name');
      return;
    }

    if (selectedProducts.length === 0 || billSummary.itemCount === 0) {
      alert('Please add at least one item to the bill');
      return;
    }

    try {
      const billData = {
        ...formData,
        items: selectedProducts.filter(p => p.quantity > 0).map(p => ({
          id: p.actualId,
          type: p.type,
          name: p.name,
          quantity: p.quantity,
          price: p.price
        })),
        summary: billSummary
      };

      const response = await axios.post('/api/billing', billData);
      
      if (response.data.success) {
        alert('Bill created successfully!');
        navigate('/billing/list');
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      alert(error.response?.data?.message || 'Error creating bill. Please try again.');
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'service': return '🔧';
      case 'custom': return '✏️';
      default: return '📦';
    }
  };

  const getItemBorderColor = (type) => {
    switch (type) {
      case 'service': return '#28a745';
      case 'custom': return '#fd7e14';
      default: return '#0d6efd';
    }
  };

  return (
    <div className="billing-wrapper">
      <Navigation />
      <div className="billing-container">
        <div className="billing-content-wrapper">
          <div className="billing-header">
            <h2 className="billing-title">📄 Create New Bill</h2>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate('/billing/list')}
            >
              📋 View All Bills
            </button>
          </div>

          <form onSubmit={handleSubmit} id="billingForm">
            <div className="billing-layout">
              {/* Left Column */}
              <div className="billing-left">
                {/* Shop Info */}
                <div className="content-card shop-info-card">
                  <div className="shop-info-header">
                    <div>
                      <h5 className="shop-name">🏪 {shopSettings.shopName}</h5>
                      <small className="shop-details">
                        <span>{shopSettings.shopPhone}</span>
                        {shopSettings.shopGstin && (
                          <>
                            <span> | GSTIN: </span>
                            <span>{shopSettings.shopGstin}</span>
                          </>
                        )}
                        {!shopSettings.shopGstin && <span> | GSTIN: </span>}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => navigate('/shop-settings')}
                    >
                      ✏️ Edit Shop Details
                    </button>
                  </div>
                </div>

                {/* Buyer Details */}
                <div className="content-card">
                  <h5 className="section-title">👤 Buyer Details (Customer)</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="buyerName" className="form-label">
                        Buyer Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="buyerName"
                        name="buyerName"
                        value={formData.buyerName}
                        onChange={handleInputChange}
                        required
                        placeholder="Customer Name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="buyerPhone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="buyerPhone"
                        name="buyerPhone"
                        value={formData.buyerPhone}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="buyerEmail" className="form-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="buyerEmail"
                        name="buyerEmail"
                        value={formData.buyerEmail}
                        onChange={handleInputChange}
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="buyerAddress" className="form-label">
                        Address
                      </label>
                      <textarea
                        className="form-control"
                        id="buyerAddress"
                        name="buyerAddress"
                        rows="3"
                        value={formData.buyerAddress}
                        onChange={handleInputChange}
                        placeholder="Customer Address"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="content-card">
                  <h5 className="section-title">🛒 Select Products</h5>
                  
                  <div className="form-group">
                    <label htmlFor="productSearch" className="form-label">
                      Search All Items
                    </label>
                    <div className="search-wrapper">
                      <div className="input-group">
                        <span className="input-group-text">🔍</span>
                        <input
                          type="text"
                          className="form-control"
                          id="productSearch"
                          placeholder="Type product, service, or other..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onFocus={() => setShowSearchResults(true)}
                          autoComplete="off"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => {
                            setSearchTerm('');
                            setShowSearchResults(false);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      {showSearchResults && filteredItems.length > 0 && (
                        <div className="search-results">
                          {filteredItems.map(item => (
                            <div
                              key={item.id}
                              className="search-result-item"
                              onClick={() => selectProduct(item.id)}
                            >
                              <div className="result-content">
                                <div className="result-name">
                                  {getItemIcon(item.type)} {item.name}
                                </div>
                                <div className="result-info">{item.displayInfo}</div>
                              </div>
                              <span className="result-action">Click to add →</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <small className="form-text">
                      Search products, services, or other items - click to add to bill
                    </small>
                  </div>

                  {/* Custom Item Entry */}
                  <div className="custom-item-card">
                    <h6 className="custom-item-title">✏️ Quick Add Custom Item</h6>
                    <div className="custom-item-form">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Item name (e.g., Repair Service, Accessory...)"
                        value={customItem.name}
                        onChange={(e) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                      />
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Qty"
                        min="1"
                        value={customItem.quantity}
                        onChange={(e) => setCustomItem(prev => ({ ...prev, quantity: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                      />
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Price (₹)"
                        min="0"
                        step="0.01"
                        value={customItem.price}
                        onChange={(e) => setCustomItem(prev => ({ ...prev, price: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={addCustomItem}
                      >
                        ➕ Add
                      </button>
                    </div>
                    <small className="form-text">
                      💡 Quickly add any item without adding it to inventory
                    </small>
                  </div>

                  {/* Selected Products List */}
                  <div className="selected-products-section">
                    {selectedProducts.length === 0 ? (
                      <div className="empty-products">
                        <i>No items added yet. Search and click to add items above.</i>
                      </div>
                    ) : (
                      <>
                        <h6 className="selected-title">
                          📦 Selected Items ({selectedProducts.filter(p => p.quantity > 0).length})
                        </h6>
                        {selectedProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className="product-row"
                            style={{ borderLeftColor: getItemBorderColor(product.type) }}
                          >
                            <div className="product-info">
                              <strong>
                                {getItemIcon(product.type)} {product.name}
                              </strong>
                              <small className="product-meta">
                                {product.type === 'product' ? `Max Stock: ${product.maxStock}` : product.type}
                              </small>
                            </div>
                            <div className="product-controls">
                              <div className="control-group">
                                <label className="control-label">Quantity</label>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={product.quantity}
                                  min="1"
                                  max={product.maxStock}
                                  onChange={(e) => updateProductQuantity(index, e.target.value)}
                                />
                              </div>
                              <div className="control-group">
                                <label className="control-label">Price (₹)</label>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={product.price}
                                  step="0.01"
                                  min="0"
                                  onChange={(e) => updateProductPrice(index, e.target.value)}
                                />
                              </div>
                              <div className="control-group">
                                <label className="control-label">Total</label>
                                <div className="total-display">
                                  ₹{(product.quantity * product.price).toFixed(2)}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removeProduct(index)}
                                title="Remove product"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* GST Section */}
                <div className="content-card gst-section">
                  <h5 className="section-title">💼 GST Details</h5>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="gstEnabled"
                      name="gstEnabled"
                      checked={formData.gstEnabled}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="gstEnabled">
                      <strong>Enable GST</strong>
                    </label>
                  </div>

                  {formData.gstEnabled && (
                    <div className="gst-details">
                      <div className="form-group mb-3">
                        <label className="form-label">GST Type</label>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gstType"
                            id="gstIntraState"
                            value="intra"
                            checked={formData.gstType === 'intra'}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="gstIntraState">
                            Intra-State (CGST + SGST)
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gstType"
                            id="gstInterState"
                            value="inter"
                            checked={formData.gstType === 'inter'}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="gstInterState">
                            Inter-State (IGST)
                          </label>
                        </div>
                      </div>

                      {formData.gstType === 'intra' ? (
                        <div className="form-grid">
                          <div className="form-group">
                            <label htmlFor="cgstRate" className="form-label">
                              CGST Rate (%)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              id="cgstRate"
                              name="cgstRate"
                              value={formData.cgstRate}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="sgstRate" className="form-label">
                              SGST Rate (%)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              id="sgstRate"
                              name="sgstRate"
                              value={formData.sgstRate}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="form-group">
                          <label htmlFor="igstRate" className="form-label">
                            IGST Rate (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="igstRate"
                            name="igstRate"
                            value={formData.igstRate}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="content-card">
                  <h5 className="section-title">📝 Additional Details</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="paymentMethod" className="form-label">
                        Payment Method
                      </label>
                      <select
                        className="form-select"
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
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
                        placeholder="Any additional notes..."
                      />
                    </div>
                    <div className="form-group full-width">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="showSignature"
                          name="showSignature"
                          checked={formData.showSignature}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="showSignature">
                          <strong>Show Signature Section on Invoice</strong>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Bill Summary */}
              <div className="billing-right">
                <div className="bill-summary-card">
                  <h5 className="summary-title">💰 Bill Summary</h5>
                  
                  <div className="summary-row">
                    <span>Items Selected:</span>
                    <span className="summary-value">{billSummary.itemCount}</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Total Quantity:</span>
                    <span className="summary-value">{billSummary.totalQuantity}</span>
                  </div>
                  
                  <hr className="summary-divider" />
                  
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span className="summary-value">₹{billSummary.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {formData.gstEnabled && billSummary.subtotal > 0 && (
                    <>
                      {formData.gstType === 'intra' ? (
                        <>
                          <div className="summary-row">
                            <span>CGST ({formData.cgstRate.toFixed(2)}%):</span>
                            <span>₹{billSummary.cgstAmount.toFixed(2)}</span>
                          </div>
                          <div className="summary-row">
                            <span>SGST ({formData.sgstRate.toFixed(2)}%):</span>
                            <span>₹{billSummary.sgstAmount.toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="summary-row">
                          <span>IGST ({formData.igstRate.toFixed(2)}%):</span>
                          <span>₹{billSummary.igstAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <hr className="summary-divider" />
                  
                  <div className="summary-total">
                    <h5>Total Amount:</h5>
                    <h4 className="total-amount">₹{billSummary.total.toFixed(2)}</h4>
                  </div>
                  
                  <button type="submit" className="btn btn-success btn-lg w-100">
                    🧾 Generate Bill
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary w-100 mt-2"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Billing;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';
import './ShopSettings.css';

const ShopSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    shopPhone: '',
    shopEmail: '',
    shopGstin: '',
    shopAddress: '',
    defaultCgstRate: 9.0,
    defaultSgstRate: 9.0,
    defaultIgstRate: 18.0,
    shopLogoUrl: ''
  });

  useEffect(() => {
    fetchShopSettings();
  }, []);

  const fetchShopSettings = async () => {
    try {
      const response = await axios.get('/api/shop-settings');
      if (response.data.success && response.data.data) {
        setFormData(prev => ({
          ...prev,
          ...response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
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

    if (!formData.shopName.trim()) {
      alert('⚠️ Shop Name is required!\n\nPlease enter your shop or business name.');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post('/api/shop-settings', formData);
      if (response.data.success) {
        alert('Settings updated successfully!');
        fetchShopSettings();
      }
    } catch (error) {
      console.error('Error saving shop settings:', error);
      alert(error.response?.data?.message || 'Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="shop-settings-wrapper">
        <Navigation />
        <div className="shop-settings-container">
          <div className="loading-message">Loading shop settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-settings-wrapper">
      <Navigation />
      <div className="shop-settings-container">
        <div className="shop-settings-content-wrapper">
          <div className="content-card">
            <div className="settings-header">
              <h2 className="settings-title">⚙️ Shop Settings</h2>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                ← Back to Dashboard
              </button>
            </div>

            <div className="info-alert">
              <strong>ℹ️ Info:</strong> These details will be automatically used in all your bills and invoices.
            </div>

            <form onSubmit={handleSubmit}>
              {/* Basic Shop Information */}
              <div className="settings-section">
                <h5 className="section-title">🏪 Basic Information</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="shopName" className="form-label">
                      Shop/Business Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="shopName"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your shop name"
                      onBlur={(e) => e.target.value = e.target.value.trim()}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shopPhone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="shopPhone"
                      name="shopPhone"
                      value={formData.shopPhone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                      onBlur={(e) => e.target.value = e.target.value.trim()}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shopEmail" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="shopEmail"
                      name="shopEmail"
                      value={formData.shopEmail}
                      onChange={handleInputChange}
                      placeholder="shop@example.com"
                      onBlur={(e) => e.target.value = e.target.value.trim()}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shopGstin" className="form-label">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="shopGstin"
                      name="shopGstin"
                      value={formData.shopGstin}
                      onChange={handleInputChange}
                      placeholder="22AAAAA0000A1Z5"
                      maxLength="15"
                      onBlur={(e) => e.target.value = e.target.value.trim()}
                    />
                    <small className="form-text">
                      Enter your GST registration number if applicable
                    </small>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="shopAddress" className="form-label">
                      Address
                    </label>
                    <textarea
                      className="form-control"
                      id="shopAddress"
                      name="shopAddress"
                      rows="3"
                      value={formData.shopAddress}
                      onChange={handleInputChange}
                      placeholder="Enter your shop address"
                      onBlur={(e) => e.target.value = e.target.value.trim()}
                    />
                  </div>
                </div>
              </div>

              {/* GST Default Rates */}
              <div className="settings-section">
                <h5 className="section-title">💼 Default GST Rates</h5>
                <p className="section-description">
                  These rates will be pre-filled when creating bills (you can change them per bill)
                </p>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="defaultCgstRate" className="form-label">
                      Default CGST Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="defaultCgstRate"
                      name="defaultCgstRate"
                      value={formData.defaultCgstRate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      placeholder="9.00"
                    />
                    <small className="form-text">Central GST (Intra-State)</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="defaultSgstRate" className="form-label">
                      Default SGST Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="defaultSgstRate"
                      name="defaultSgstRate"
                      value={formData.defaultSgstRate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      placeholder="9.00"
                    />
                    <small className="form-text">State GST (Intra-State)</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="defaultIgstRate" className="form-label">
                      Default IGST Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="defaultIgstRate"
                      name="defaultIgstRate"
                      value={formData.defaultIgstRate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      placeholder="18.00"
                    />
                    <small className="form-text">Integrated GST (Inter-State)</small>
                  </div>
                </div>

                <div className="gst-info-card">
                  <strong>📌 Common GST Rates in India:</strong>
                  <ul className="gst-rates-list">
                    <li>5% GST: CGST 2.5% + SGST 2.5% or IGST 5%</li>
                    <li>12% GST: CGST 6% + SGST 6% or IGST 12%</li>
                    <li>18% GST: CGST 9% + SGST 9% or IGST 18%</li>
                    <li>28% GST: CGST 14% + SGST 14% or IGST 28%</li>
                  </ul>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="settings-section">
                <h5 className="section-title">🎨 Additional Settings (Optional)</h5>
                <div className="form-group">
                  <label htmlFor="shopLogoUrl" className="form-label">
                    Shop Logo URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    id="shopLogoUrl"
                    name="shopLogoUrl"
                    value={formData.shopLogoUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/logo.png"
                    onBlur={(e) => e.target.value = e.target.value.trim()}
                  />
                  <small className="form-text">
                    Enter a URL to your shop logo (will be displayed on invoices in future updates)
                  </small>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-success btn-lg"
                  disabled={saving}
                >
                  💾 {saving ? 'Saving...' : 'Update Settings'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="content-card preview-card">
            <h5 className="preview-title">👁️ Preview - How it will appear on invoices</h5>
            <div className="preview-box">
              <h6 className="preview-shop-name">{formData.shopName || 'Shop Name'}</h6>
              {formData.shopAddress && (
                <div className="preview-address">{formData.shopAddress}</div>
              )}
              <div className="preview-details">
                {formData.shopPhone && (
                  <div>
                    <strong>Phone:</strong> <span>{formData.shopPhone}</span>
                  </div>
                )}
                {formData.shopEmail && (
                  <div>
                    <strong>Email:</strong> <span>{formData.shopEmail}</span>
                  </div>
                )}
                {formData.shopGstin && (
                  <div>
                    <strong>GSTIN:</strong> <span>{formData.shopGstin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSettings;
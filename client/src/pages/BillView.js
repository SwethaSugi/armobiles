import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';
import './BillView.css';

const BillView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [shopSettings, setShopSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBill();
    fetchShopSettings();
  }, [id]);

  const fetchBill = async () => {
    try {
      const response = await axios.get(`/api/billing/${id}`);
      if (response.data.success) {
        setBill(response.data.data);
      } else {
        setError('Bill not found');
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
      setError('Error loading bill');
    } finally {
      setLoading(false);
    }
  };

  const fetchShopSettings = async () => {
    try {
      const response = await axios.get('/api/shop-settings');
      if (response.data.success && response.data.data) {
        setShopSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
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
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bill-view-wrapper">
        <Navigation />
        <div className="bill-view-container">
          <div className="loading-message">Loading bill...</div>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="bill-view-wrapper">
        <Navigation />
        <div className="bill-view-container">
          <div className="error-message">
            <h3>❌ {error || 'Bill not found'}</h3>
            <button className="btn btn-primary" onClick={() => navigate('/billing/list')}>
              ← Back to Bills List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse items if it's a string
  const items = typeof bill.items === 'string' ? JSON.parse(bill.items) : (bill.items || []);

  return (
    <div className="bill-view-wrapper">
      <Navigation />
      <div className="bill-view-container">
        <div className="bill-view-content">
          {/* Action Buttons */}
          <div className="bill-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/billing/list')}>
              ← Back to List
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              🖨️ Print
            </button>
          </div>

          {/* Invoice Container */}
          <div className="invoice-container">
            {/* Invoice Header */}
            <div className="invoice-header">
              <div className="shop-info">
                <h2 className="shop-name">
                  {shopSettings?.shopName || 'AR MOBILES AND AR ESEVAI'}
                </h2>
                {shopSettings?.shopAddress && (
                  <p className="shop-address">{shopSettings.shopAddress}</p>
                )}
                <div className="shop-contact">
                  {shopSettings?.shopPhone && (
                    <span>📞 {shopSettings.shopPhone}</span>
                  )}
                  {shopSettings?.shopEmail && (
                    <span>✉️ {shopSettings.shopEmail}</span>
                  )}
                  {shopSettings?.shopGstin && (
                    <span>🏢 GSTIN: {shopSettings.shopGstin}</span>
                  )}
                </div>
              </div>
              <div className="invoice-title">
                <h1>TAX INVOICE</h1>
                <div className="invoice-number">
                  <strong>Bill No:</strong> {bill.billNumber || `BILL-${String(bill.id).padStart(6, '0')}`}
                </div>
                <div className="invoice-date">
                  <strong>Date:</strong> {formatDate(bill.date || bill.createdAt)}
                </div>
              </div>
            </div>

            {/* Buyer Information */}
            <div className="buyer-section">
              <div className="section-title">Bill To:</div>
              <div className="buyer-details">
                <div className="buyer-name">{bill.buyerName}</div>
                {bill.buyerPhone && (
                  <div className="buyer-contact">📞 {bill.buyerPhone}</div>
                )}
                {bill.buyerEmail && (
                  <div className="buyer-contact">✉️ {bill.buyerEmail}</div>
                )}
                {bill.buyerAddress && (
                  <div className="buyer-address">{bill.buyerAddress}</div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="items-section">
              <table className="items-table">
                <thead>
                  <tr>
                    <th className="col-sno">S.No</th>
                    <th className="col-item">Item Description</th>
                    <th className="col-qty">Qty</th>
                    <th className="col-price">Unit Price</th>
                    <th className="col-total">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="col-sno">{index + 1}</td>
                      <td className="col-item">
                        <strong>{item.name}</strong>
                        {item.type && (
                          <small className="item-type"> ({item.type})</small>
                        )}
                      </td>
                      <td className="col-qty">{item.quantity || 1}</td>
                      <td className="col-price">₹{formatCurrency(item.price)}</td>
                      <td className="col-total">₹{formatCurrency((item.quantity || 1) * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="summary-section">
              <div className="summary-left">
                {bill.notes && (
                  <div className="notes-section">
                    <strong>Notes:</strong>
                    <p>{bill.notes}</p>
                  </div>
                )}
                {bill.showSignature && (
                  <div className="signature-section">
                    <div className="signature-line"></div>
                    <div className="signature-label">Authorized Signature</div>
                  </div>
                )}
              </div>
              <div className="summary-right">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{formatCurrency(bill.subtotal)}</span>
                </div>
                {bill.gstEnabled && (
                  <>
                    {bill.gstType === 'intra' ? (
                      <>
                        <div className="summary-row">
                          <span>CGST ({bill.cgstRate}%):</span>
                          <span>₹{formatCurrency(bill.cgstAmount)}</span>
                        </div>
                        <div className="summary-row">
                          <span>SGST ({bill.sgstRate}%):</span>
                          <span>₹{formatCurrency(bill.sgstAmount)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="summary-row">
                        <span>IGST ({bill.igstRate}%):</span>
                        <span>₹{formatCurrency(bill.igstAmount)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="summary-row total-row">
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>₹{formatCurrency(bill.total)}</strong></span>
                </div>
                <div className="payment-method">
                  <strong>Payment Method:</strong> {bill.paymentMethod || 'Cash'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="invoice-footer">
              <p>Thank you for your business!</p>
              <p className="footer-note">This is a computer-generated invoice.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillView;
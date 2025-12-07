import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import Navigation from '../components/Navigation';
  import { useAuth } from '../context/AuthContext';
  import axios from 'axios';
  import './ChangePassword.css';

  const ChangePassword = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    };

    const validateForm = () => {
      const newErrors = {};

      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (formData.currentPassword === formData.newPassword) {
        newErrors.newPassword = 'New password must be different from current password';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setSuccess(false);

      try {
        const response = await axios.post('/api/auth/change-password', {
          username: user?.username || 'admin',
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });

        if (response.data.success) {
          setSuccess(true);
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          
          // Show success message and redirect after 2 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setErrors({ submit: response.data.message || 'Error changing password' });
        }
      } catch (error) {
        console.error('Error changing password:', error);
        setErrors({
          submit: error.response?.data?.message || 'Error changing password. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="change-password-wrapper">
        <Navigation />
        <div className="change-password-container">
          <div className="password-card">
            <div className="password-header">
              <h3>🔐 Change Password</h3>
              <p className="text-muted">Update your account password</p>
            </div>

            {success && (
              <div className="alert alert-success">
                ✅ Password changed successfully! Redirecting to dashboard...
              </div>
            )}

            {errors.submit && (
              <div className="alert alert-danger">
                ❌ {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={user?.username || 'admin'}
                  disabled
                />
              </div>

              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                />
                {errors.currentPassword && (
                  <div className="invalid-feedback">{errors.currentPassword}</div>
                )}
                <small className="text-muted">Enter your current password to verify</small>
              </div>

              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  minLength="6"
                  required
                />
                {errors.newPassword && (
                  <div className="invalid-feedback">{errors.newPassword}</div>
                )}
                <small className="text-muted">Minimum 6 characters</small>
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  minLength="6"
                  required
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
                <small className="text-muted">Re-enter your new password</small>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </button>
              </div>
            </form>

            <div className="alert alert-info mt-4">
              <strong>💡 Password Tips:</strong>
              <ul className="mb-0 mt-2">
                <li>Use at least 6 characters</li>
                <li>Mix letters, numbers, and symbols</li>
                <li>Don't use common words or patterns</li>
                <li>Keep your password secure and private</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default ChangePassword;
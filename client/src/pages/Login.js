import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'otp', 'reset'
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });

      if (response.data.success) {
        login(response.data.user);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Network error. Please check if the server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setForgotPasswordLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password/send-otp', {
        email: forgotPasswordData.email
      });

      if (response.data.success) {
        let successMessage = response.data.message || 'If the email exists, we\'ll send you an OTP.';
        if (response.data.note) {
          successMessage += `\n\nℹ️ ${response.data.note}`;
        }

        setForgotPasswordSuccess(successMessage);
        setForgotPasswordStep('otp');
        setForgotPasswordData(prev => ({ ...prev, otp: '' }));
      } else {
        setForgotPasswordError(response.data.message || 'Failed to generate OTP');
      }
    } catch (err) {
      setForgotPasswordError(
        err.response?.data?.message || 
        'Failed to send OTP. Please try again.'
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyOTPAndReset = async () => {
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setForgotPasswordError('Passwords do not match');
      return;
    }

    if (forgotPasswordData.newPassword.length < 6) {
      setForgotPasswordError('Password must be at least 6 characters long');
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password/verify-otp', {
        email: forgotPasswordData.email,
        otp: forgotPasswordData.otp,
        newPassword: forgotPasswordData.newPassword
      });

      if (response.data.success) {
        setForgotPasswordSuccess('Password reset successfully! You can now login with your new password.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStep('email');
          setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
          setForgotPasswordError('');
          setForgotPasswordSuccess('');
        }, 2000);
      } else {
        setForgotPasswordError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setForgotPasswordError(
        err.response?.data?.message || 
        'Failed to reset password. Please check your OTP and try again.'
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>🏪 TNLocalShop</h2>
          <p className="text-muted">Please login to continue</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="forgot-password-link">
            <button
              type="button"
              className="btn-link"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="modal-overlay" onClick={() => !forgotPasswordLoading && setShowForgotPassword(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🔐 Forgot Password</h3>
                <button
                  className="modal-close"
                  onClick={() => {
                    if (!forgotPasswordLoading) {
                      setShowForgotPassword(false);
                      setForgotPasswordStep('email');
                      setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
                      setForgotPasswordError('');
                      setForgotPasswordSuccess('');
                    }
                  }}
                  disabled={forgotPasswordLoading}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {forgotPasswordError && (
                  <div className="alert alert-danger">{forgotPasswordError}</div>
                )}
                {forgotPasswordSuccess && (
                  <div className="alert alert-success">{forgotPasswordSuccess}</div>
                )}

                {forgotPasswordStep === 'email' && (
                  <div>
                    <p>Enter your email address to receive an OTP for password reset.</p>
                    <div className="form-group">
                      <label htmlFor="forgotEmail" className="form-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="forgotEmail"
                        value={forgotPasswordData.email}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        disabled={forgotPasswordLoading}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={handleSendOTP}
                      disabled={forgotPasswordLoading || !forgotPasswordData.email}
                    >
                      {forgotPasswordLoading ? 'Generating OTP...' : 'Get OTP'}
                    </button>
                  </div>
                )}

                {forgotPasswordStep === 'otp' && (
                  <div>
                    <p>Enter the 6-digit OTP sent to your email address.</p>
                    <div className="form-group">
                      <label htmlFor="forgotOTP" className="form-label">
                        OTP Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="forgotOTP"
                        value={forgotPasswordData.otp}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        placeholder="000000"
                        maxLength="6"
                        disabled={forgotPasswordLoading}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="forgotNewPassword" className="form-label">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="forgotNewPassword"
                        value={forgotPasswordData.newPassword}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
                        placeholder="Minimum 6 characters"
                        disabled={forgotPasswordLoading}
                        required
                        minLength="6"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="forgotConfirmPassword" className="form-label">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="forgotConfirmPassword"
                        value={forgotPasswordData.confirmPassword}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        disabled={forgotPasswordLoading}
                        required
                        minLength="6"
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={handleVerifyOTPAndReset}
                      disabled={forgotPasswordLoading || !forgotPasswordData.otp || !forgotPasswordData.newPassword || !forgotPasswordData.confirmPassword}
                    >
                      {forgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary w-100 mt-2"
                      onClick={() => setForgotPasswordStep('email')}
                      disabled={forgotPasswordLoading}
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;


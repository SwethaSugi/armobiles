const express = require('express');
const router = express.Router();
const { loginUser, changePassword, sendOTP, verifyOTPAndResetPassword } = require('../controllers/authController');

// Login route
router.post('/login', loginUser);

// Change password route
router.post('/change-password', changePassword);

// Forgot password routes
router.post('/forgot-password/send-otp', sendOTP);
router.post('/forgot-password/verify-otp', verifyOTPAndResetPassword);

module.exports = router;
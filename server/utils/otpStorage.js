// In-memory OTP storage (for production, use Redis or database)
// Format: { email: { otp, expiresAt, attempts } }
const otpStore = new Map();

// Clean expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

// Store OTP
const storeOTP = (email, otp) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, {
    otp,
    expiresAt,
    attempts: 0,
    createdAt: Date.now()
  });
};

// Verify OTP
const verifyOTP = (email, otp) => {
  const data = otpStore.get(email);
  
  if (!data) {
    return { valid: false, message: 'OTP not found or expired' };
  }

  if (data.expiresAt < Date.now()) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP has expired' };
  }

  if (data.attempts >= 5) {
    otpStore.delete(email);
    return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }

  if (data.otp !== otp) {
    data.attempts++;
    return { valid: false, message: 'Invalid OTP' };
  }

  // OTP is valid
  otpStore.delete(email);
  return { valid: true };
};

// Remove OTP (after successful password reset)
const removeOTP = (email) => {
  otpStore.delete(email);
};

module.exports = {
  storeOTP,
  verifyOTP,
  removeOTP
};
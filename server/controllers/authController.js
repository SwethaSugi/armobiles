const { readExcelFile, findUserByCredentials, updateUserPassword } = require('../utils/excelHandler');
const { sendOTPEmail, generateOTP } = require('../utils/emailService');
const { storeOTP, verifyOTP, removeOTP } = require('../utils/otpStorage');

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Read users from Excel file
        const users = await readExcelFile();

        // Find user by credentials
        const user = findUserByCredentials(users, username, password);

        if (user) {
            // Login successful
            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    username: user.username,
                    role: user.role || 'admin'
                }
            });
        } else {
            // Invalid credentials
            res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;

        if (!username || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Username, current password, and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Read users from Excel file
        const users = await readExcelFile();

        // Find user by credentials to verify current password
        const user = findUserByCredentials(users, username, currentPassword);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        const success = await updateUserPassword(username, newPassword);

        if (success) {
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error updating password'
            });
        }
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Read users from Excel file
        const users = await readExcelFile();

        // Find user by email
        const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            // Don't reveal if email exists or not (security best practice)
            return res.json({
                success: true,
                message: 'If the email exists, an OTP has been sent'
            });
        }

        // Generate and store OTP
        const otp = generateOTP();
        storeOTP(email.toLowerCase(), otp);

        // Try to send email without exposing OTP in the API response
        let emailSent = false;
        let emailMessage = 'If the email exists, an OTP has been sent';
        let additionalNote = '';

        try {
            const emailResult = await sendOTPEmail(email, otp);
            emailSent = true;

            if (!process.env.EMAIL_USER && emailResult.previewUrl) {
                console.log('\n📧 EMAIL PREVIEW URL:', emailResult.previewUrl);
                additionalNote = 'Email sent in test mode. Check the preview URL in the server logs.';
            } else {
                emailMessage = 'OTP has been sent to your email address.';
            }
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            emailMessage = 'OTP generated successfully. Please check your email.';
            additionalNote = 'Email sending failed. Please verify your mail configuration or contact the administrator.';
        }

        // Respond without exposing OTP for security
        res.json({
            success: true,
            message: emailMessage,
            emailSent: emailSent,
            note: additionalNote
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

const verifyOTPAndResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Verify OTP
        const otpVerification = verifyOTP(email.toLowerCase(), otp);

        if (!otpVerification.valid) {
            return res.status(400).json({
                success: false,
                message: otpVerification.message
            });
        }

        // Read users from Excel file
        const users = await readExcelFile();

        // Find user by email
        const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password
        const success = await updateUserPassword(user.username, newPassword);

        if (success) {
            // Remove OTP after successful password reset
            removeOTP(email.toLowerCase());
            res.json({
                success: true,
                message: 'Password has been reset successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error updating password'
            });
        }
    } catch (error) {
        console.error('Verify OTP and reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = {
    loginUser,
    changePassword,
    sendOTP,
    verifyOTPAndResetPassword
};
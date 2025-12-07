const nodemailer = require('nodemailer');

// Create transporter - using Gmail as example (free)
// For production, use environment variables
const createTransporter = () => {
  // Option 1: Gmail (requires app password)
  // You need to enable "Less secure app access" or use App Password
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password for Gmail
      }
    });
  }

  // Option 2: Ethereal Email (free testing - no setup required)
  // This creates a test account automatically
  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass'
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    // If no email configuration, use Ethereal (free testing email)
    if (!process.env.EMAIL_USER) {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const mailOptions = {
        from: testAccount.user,
        to: email,
        subject: 'Password Reset OTP - AR Mobiles',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password for AR Mobiles account.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">AR Mobiles and AR Esevai</p>
          </div>
        `,
        text: `Your password reset OTP is: ${otp}. This OTP is valid for 10 minutes.`
      };

      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('📧 EMAIL PREVIEW URL (Click to view email):');
      console.log('   ' + previewUrl);
      console.log('═══════════════════════════════════════════════════════════\n');
      return { success: true, messageId: info.messageId, previewUrl: previewUrl };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@armobiles.com',
      to: email,
      subject: 'Password Reset OTP - AR Mobiles',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password for AR Mobiles account.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">AR Mobiles and AR Esevai</p>
        </div>
      `,
      text: `Your password reset OTP is: ${otp}. This OTP is valid for 10 minutes.`
    };

    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal, log the preview URL
    if (!process.env.EMAIL_USER) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email. Please check your email configuration.');
  }
};

module.exports = {
  sendOTPEmail,
  generateOTP
};
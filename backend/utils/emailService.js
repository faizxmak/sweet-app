const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP with proper configuration
// For Gmail, use an App Password: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS (not SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generate a random 6-digit admin code
function generateAdminCode() {
  return Math.random().toString().slice(2, 8).padStart(6, '0');
}

// Send admin code email
async function sendAdminCodeEmail(email, adminCode) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Admin Code for Sweet Shop',
      html: `
        <h1>Welcome to Sweet Shop Admin!</h1>
        <p>Your admin verification code is:</p>
        <h2 style="color: #d4a574; font-size: 32px; letter-spacing: 5px;">${adminCode}</h2>
        <p>This code will expire in 24 hours.</p>
        <p>Use this code during registration to become an admin.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error.message);
    return false;
  }
}

module.exports = { generateAdminCode, sendAdminCodeEmail };

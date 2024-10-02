const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., smtp.yourdomain.com
  port: process.env.SMTP_PORT, // e.g., 587 or 465
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for port 587
  auth: {
    user: process.env.SMTP_USER, // Your SMTP username
    pass: process.env.SMTP_PASS, // Your SMTP password
  },
});

module.exports = transporter;
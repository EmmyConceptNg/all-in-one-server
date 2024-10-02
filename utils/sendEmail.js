// services/email.js
const transporter = require('../config/smtp');

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL, // Sender's email address
      to, // Recipient's email address
      subject,
      text,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

module.exports = sendEmail;

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Define the email options
  const mailOptions = {
    from: process.env.SMTP_FROM || '"FarmersMarket" <noreply@farmersmarket.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error('Email could not be sent. Log:', error);
    // Don't throw error in development if credentials aren't set
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Ensure SMTP_USER and SMTP_PASS are set in .env');
    } else {
      throw error;
    }
  }
};

module.exports = sendEmail;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const pool = require('../config/database');
const sendEmail = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register user
const register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, phone, role = 'buyer' } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, role]
    );

    const userId = result.insertId;

    // If role is farmer, create farmer profile
    if (role === 'farmer') {
      await pool.execute(
        'INSERT INTO farmers (user_id, farm_name, location, rating) VALUES (?, ?, ?, ?)',
        [userId, '', '', 0.00]
      );
    }

    // Generate token
    const token = generateToken(userId);

    // Get user details
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: users[0],
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT id, name, email, password, role, phone FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.password;

    // Get farmer profile if user is a farmer
    let farmerProfile = null;
    if (user.role === 'farmer') {
      const [farmers] = await pool.execute(
        'SELECT * FROM farmers WHERE user_id = ?',
        [user.id]
      );
      if (farmers.length > 0) {
        farmerProfile = farmers[0];
      }
    }

    res.json({
      message: 'Login successful',
      user,
      farmerProfile,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Get farmer profile if user is a farmer
    let farmerProfile = null;
    if (user.role === 'farmer') {
      const [farmers] = await pool.execute(
        'SELECT * FROM farmers WHERE user_id = ?',
        [userId]
      );
      if (farmers.length > 0) {
        farmerProfile = farmers[0];
      }
    }

    res.json({
      user,
      farmerProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    // Update user details
    await pool.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone, userId]
    );

    // Get updated user details
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Forgot Password - Generate OTP
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email } = req.body;

    const [users] = await pool.execute('SELECT id, name FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10');
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

    // Save OTP to DB
    await pool.execute(
      'UPDATE users SET reset_otp = ?, reset_otp_expiry = ? WHERE email = ?',
      [otp, expiryDate, email]
    );

    // Send email
    const message = `You requested a password reset. Your OTP is: ${otp}\nThis OTP is valid for ${expiryMinutes} minutes.`;
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset</h2>
        <p>Hello ${users[0].name},</p>
        <p>We received a request to reset your password. Use the following OTP to proceed:</p>
        <h1 style="color: #2e7d32; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in ${expiryMinutes} minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Regards,<br>FarmersMarket Team</p>
      </div>
    `;

    try {
      await sendEmail({
        email: email,
        subject: 'FarmersMarket Password Reset OTP',
        message: message,
        html: htmlMessage
      });
      res.json({ message: 'OTP sent to your email' });
    } catch (err) {
      // If email fails, clear the OTP for safety
      await pool.execute('UPDATE users SET reset_otp = NULL, reset_otp_expiry = NULL WHERE email = ?', [email]);
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process forgot password request' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, otp } = req.body;

    const [users] = await pool.execute(
      'SELECT id, reset_otp, reset_otp_expiry FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    if (!user.reset_otp || user.reset_otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date(user.reset_otp_expiry) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, otp, password } = req.body;

    const [users] = await pool.execute(
      'SELECT id, reset_otp, reset_otp_expiry FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Double check OTP validation just to be secure
    if (!user.reset_otp || user.reset_otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date(user.reset_otp_expiry) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and clear OTP
    await pool.execute(
      'UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expiry = NULL WHERE email = ?',
      [hashedPassword, email]
    );

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resetPassword
};

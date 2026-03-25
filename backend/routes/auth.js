const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { register, login, getProfile, updateProfile, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('role').optional().isIn(['buyer', 'farmer']).withMessage('Role must be either buyer or farmer')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

const verifyOTPValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').notEmpty().withMessage('OTP is required')
];

const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').notEmpty().withMessage('OTP is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/verify-otp', verifyOTPValidation, verifyOTP);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);

module.exports = router;

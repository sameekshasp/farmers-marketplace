const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { authenticateToken, requireBuyerOrFarmer } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} = require('../controllers/cartController');

// Validation rules
const addToCartValidation = [
  body('productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
];

const updateCartValidation = [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
];

// All cart routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/add', requireBuyerOrFarmer, addToCartValidation, addToCart);
router.put('/:cartId', requireBuyerOrFarmer, updateCartValidation, updateCartItem);
router.delete('/:cartId', requireBuyerOrFarmer, removeFromCart);
router.delete('/', requireBuyerOrFarmer, clearCart);

module.exports = router;

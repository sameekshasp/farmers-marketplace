const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { authenticateToken, requireBuyerOrFarmer } = require('../middleware/auth');
const {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReviews
} = require('../controllers/reviewController');

// Validation rules
const addReviewValidation = [
  body('productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters')
];

const updateReviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters')
];

// Public routes
router.get('/product/:productId', getProductReviews);

// Authenticated routes
router.use(authenticateToken);

// User review routes
router.post('/', requireBuyerOrFarmer, addReviewValidation, addReview);
router.get('/user', requireBuyerOrFarmer, getUserReviews);
router.put('/:reviewId', requireBuyerOrFarmer, updateReviewValidation, updateReview);
router.delete('/:reviewId', requireBuyerOrFarmer, deleteReview);

module.exports = router;

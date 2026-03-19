const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Add review for a product
const addReview = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ? AND is_available = true',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const [existingReviews] = await pool.execute(
      'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add review
    await pool.execute(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, productId, rating, comment]
    );

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Failed to add review' });
  }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if product exists
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ? AND is_available = true',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get reviews with pagination
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, parseInt(limit) || 10);
    const offset = (parsedPage - 1) * parsedLimit;
    
    // Ensure values are valid integers for MySQL
    const safeLimit = parseInt(parsedLimit);
    const safeOffset = parseInt(offset);
    
    if (isNaN(safeLimit) || isNaN(safeOffset) || safeLimit < 1 || safeOffset < 0) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const [reviews] = await pool.execute(
      `SELECT r.*, u.name as reviewer_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [productId]
    );

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE product_id = ?',
      [productId]
    );

    // Calculate average rating
    const [ratingResult] = await pool.execute(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ?',
      [productId]
    );

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      },
      avgRating: ratingResult[0].avg_rating || 0
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ message: 'Failed to get product reviews' });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Check if review exists and belongs to user
    const [reviews] = await pool.execute(
      'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found or access denied' });
    }

    // Update review
    await pool.execute(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, reviewId]
    );

    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    // Check if review exists and belongs to user
    const [reviews] = await pool.execute(
      'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found or access denied' });
    }

    // Delete review
    await pool.execute(
      'DELETE FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

// Get user's reviews
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, parseInt(limit) || 10);
    const offset = (parsedPage - 1) * parsedLimit;
    
    // Ensure values are valid integers for MySQL
    const safeLimit = parseInt(parsedLimit);
    const safeOffset = parseInt(offset);
    
    if (isNaN(safeLimit) || isNaN(safeOffset) || safeLimit < 1 || safeOffset < 0) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const [reviews] = await pool.execute(
      `SELECT r.*, p.name as product_name, p.image_url as product_image FROM reviews r JOIN products p ON r.product_id = p.id WHERE r.user_id = ? ORDER BY r.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [userId]
    );

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE user_id = ?',
      [userId]
    );

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Failed to get user reviews' });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReviews
};

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { authenticateToken, requireFarmer } = require('../middleware/auth');
const pool = require('../config/database');

// Get all farmers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, location } = req.query;
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, parseInt(limit) || 20);
    const offset = (parsedPage - 1) * parsedLimit;
    
    console.log('Farmers pagination params:', { page, limit, parsedPage, parsedLimit, offset });
    
    // Ensure values are valid integers for MySQL
    const safeLimit = parseInt(parsedLimit);
    const safeOffset = parseInt(offset);
    
    // Validate parameters are valid integers
    if (isNaN(safeLimit) || isNaN(safeOffset) || safeLimit < 1 || safeOffset < 0) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    let query = 'SELECT f.*, u.name, u.email, u.phone, COUNT(p.id) as total_products, AVG(p.price) as avg_product_price FROM farmers f JOIN users u ON f.user_id = u.id LEFT JOIN products p ON f.id = p.farmer_id AND p.is_available = true';

    const params = [];

    if (location) {
      query += ' WHERE f.location LIKE ?';
      params.push(`%${location}%`);
    }

    query += ` GROUP BY f.id ORDER BY f.rating DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    
    console.log('Farmers final query:', query);
    console.log('Farmers params:', params);

    const [farmers] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM farmers f';
    const countParams = [];

    if (location) {
      countQuery += ' WHERE f.location LIKE ?';
      countParams.push(`%${location}%`);
    }

    const [countResult] = await pool.execute(countQuery, countParams);

    res.json({
      farmers,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parsedLimit)
      }
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ message: 'Failed to get farmers' });
  }
});

// Get farmer profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [farmers] = await pool.execute(
      'SELECT f.*, u.name, u.email, u.phone, u.created_at as member_since FROM farmers f JOIN users u ON f.user_id = u.id WHERE f.id = ?',
      [id]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const farmer = farmers[0];

    // Get farmer's products
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE farmer_id = ? AND is_available = true ORDER BY created_at DESC LIMIT 10',
      [id]
    );

    // Get reviews for farmer's products
    const [reviews] = await pool.execute(
      'SELECT AVG(r.rating) as avg_rating, COUNT(*) as total_reviews FROM reviews r JOIN products p ON r.product_id = p.id WHERE p.farmer_id = ?',
      [id]
    );

    farmer.products = products;
    farmer.avg_rating = reviews[0].avg_rating || 0;
    farmer.total_reviews = reviews[0].total_reviews || 0;

    res.json(farmer);
  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({ message: 'Failed to get farmer' });
  }
});

// Update farmer profile (farmer only)
router.put('/profile', authenticateToken, requireFarmer, [
  body('farm_name').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Farm name must be between 2 and 200 characters'),
  body('location').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Location must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const userId = req.user.id;
    const { farm_name, location, description, latitude, longitude } = req.body;

    // Get farmer profile
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [userId]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const farmerId = farmers[0].id;

    // Update farmer profile
    await pool.execute(
      'UPDATE farmers SET farm_name = ?, location = ?, description = ?, latitude = ?, longitude = ? WHERE id = ?',
      [farm_name, location, description, latitude, longitude, farmerId]
    );

    res.json({ message: 'Farmer profile updated successfully' });
  } catch (error) {
    console.error('Update farmer profile error:', error);
    res.status(500).json({ message: 'Failed to update farmer profile' });
  }
});

// Get farmer dashboard data
router.get('/dashboard/stats', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get farmer profile
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [userId]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const farmerId = farmers[0].id;

    // Get dashboard stats
    const [productStats] = await pool.execute(
      'SELECT COUNT(*) as total_products, COUNT(CASE WHEN is_available = true THEN 1 END) as active_products, SUM(quantity) as total_quantity, AVG(price) as avg_price FROM products WHERE farmer_id = ?',
      [farmerId]
    );

    const [orderStats] = await pool.execute(
      'SELECT COUNT(DISTINCT o.id) as total_orders, COUNT(CASE WHEN o.status = ? THEN 1 END) as pending_orders, COUNT(CASE WHEN o.status = ? THEN 1 END) as delivered_orders, SUM(oi.quantity * oi.price) as total_revenue FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.farmer_id = ?',
      ['pending', 'delivered', farmerId]
    );

    const [reviewStats] = await pool.execute(
      'SELECT AVG(r.rating) as avg_rating, COUNT(*) as total_reviews FROM reviews r JOIN products p ON r.product_id = p.id WHERE p.farmer_id = ?',
      [farmerId]
    );

    res.json({
      products: productStats[0],
      orders: orderStats[0],
      reviews: reviewStats[0]
    });
  } catch (error) {
    console.error('Get farmer dashboard error:', error);
    res.status(500).json({ message: 'Failed to get dashboard data' });
  }
});

module.exports = router;

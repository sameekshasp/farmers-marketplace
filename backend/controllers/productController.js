const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Get all products with filters
const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      location, 
      farmerId,
      search,
      sort,
      page = 1, 
      limit = 20 
    } = req.query;

    let query = 'SELECT p.*, f.farm_name, f.location as farm_location, f.rating as farmer_rating, u.name as farmer_name, u.phone as farmer_phone FROM products p JOIN farmers f ON p.farmer_id = f.id JOIN users u ON f.user_id = u.id WHERE p.is_available = true';

    const params = [];

    // Add filters
    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (location) {
      query += ' AND f.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (farmerId) {
      query += ' AND p.farmer_id = ?';
      params.push(parseInt(farmerId));
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add pagination with strict validation
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, parseInt(limit) || 20);
    const offset = (parsedPage - 1) * parsedLimit;
    
    console.log('Pagination params:', { page, limit, parsedPage, parsedLimit, offset });
    
    // Ensure values are valid integers for MySQL
    const safeLimit = parseInt(parsedLimit);
    const safeOffset = parseInt(offset);
    
    // Validate parameters are valid integers
    if (isNaN(safeLimit) || isNaN(safeOffset) || safeLimit < 1 || safeOffset < 0) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }
    
    // Determine sort order
    let orderBy;
    switch (sort) {
      case 'price-low':  orderBy = 'p.price ASC';          break;
      case 'price-high': orderBy = 'p.price DESC';         break;
      case 'rating':     orderBy = 'f.rating DESC';        break;
      case 'oldest':     orderBy = 'p.created_at ASC';     break;
      case 'newest':
      default:           orderBy = 'p.created_at DESC';    break;
    }

    query += ` ORDER BY ${orderBy} LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    
    console.log('Final query:', query);
    console.log('Params array:', params);

    const [products] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM products p JOIN farmers f ON p.farmer_id = f.id WHERE p.is_available = true';

    const countParams = [];
    if (category) {
      countQuery += ' AND p.category = ?';
      countParams.push(category);
    }
    if (minPrice) {
      countQuery += ' AND p.price >= ?';
      countParams.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      countQuery += ' AND p.price <= ?';
      countParams.push(parseFloat(maxPrice));
    }
    if (location) {
      countQuery += ' AND f.location LIKE ?';
      countParams.push(`%${location}%`);
    }
    if (farmerId) {
      countQuery += ' AND p.farmer_id = ?';
      countParams.push(parseInt(farmerId));
    }
    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      products,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to get products' });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.execute(
      'SELECT p.*, f.farm_name, f.location as farm_location, f.rating as farmer_rating, f.description as farm_description, u.name as farmer_name, u.phone as farmer_phone FROM products p JOIN farmers f ON p.farmer_id = f.id JOIN users u ON f.user_id = u.id WHERE p.id = ? AND p.is_available = true',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    // Get product reviews
    const [reviews] = await pool.execute(
      'SELECT r.*, u.name as reviewer_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC',
      [id]
    );

    // Calculate average rating
    const [ratingResult] = await pool.execute(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE product_id = ?',
      [id]
    );

    product.reviews = reviews;
    product.avg_rating = ratingResult[0].avg_rating || 0;
    product.total_reviews = ratingResult[0].total_reviews || 0;

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to get product' });
  }
};

// Add new product (farmer only)
const addProduct = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const farmerId = req.user.id;
    const { 
      name, 
      category, 
      description, 
      price, 
      quantity, 
      unit = 'kg',
      harvest_date 
    } = req.body;

    // Get farmer profile
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [farmerId]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const farmerDbId = farmers[0].id;

    // Generate unique batch ID
    const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Insert product
    const [result] = await pool.execute(
      'INSERT INTO products (farmer_id, name, category, description, price, quantity, unit, batch_id, harvest_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [farmerDbId, name, category, description, price, quantity, unit, batchId, harvest_date]
    );

    // Add to traceability table
    await pool.execute(
      'INSERT INTO traceability (batch_id, farmer_id, product_id, harvest_date) VALUES (?, ?, ?, ?)',
      [batchId, farmerDbId, result.insertId, harvest_date]
    );

    res.status(201).json({
      message: 'Product added successfully',
      productId: result.insertId,
      batchId
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Failed to add product' });
  }
};

// Update product (farmer only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.id;

    // Get farmer profile
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [farmerId]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const farmerDbId = farmers[0].id;

    // Check if product belongs to this farmer
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ? AND farmer_id = ?',
      [id, farmerDbId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { 
      name, 
      category, 
      description, 
      price, 
      quantity, 
      unit,
      is_available 
    } = req.body;

    // Update product
    await pool.execute(
      'UPDATE products SET name = ?, category = ?, description = ?, price = ?, quantity = ?, unit = ?, is_available = ? WHERE id = ?',
      [name, category, description, price, quantity, unit, is_available, id]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete product (farmer only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.id;

    // Get farmer profile
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [farmerId]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const farmerDbId = farmers[0].id;

    // Check if product belongs to this farmer
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ? AND farmer_id = ?',
      [id, farmerDbId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    // Soft delete by setting is_available to false
    await pool.execute(
      'UPDATE products SET is_available = false WHERE id = ?',
      [id]
    );

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Get products for a specific farmer
const getFarmerProducts = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Get farmer profile
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [farmerId]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const farmerDbId = farmers[0].id;

    // Get farmer's products
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE farmer_id = ? ORDER BY created_at DESC',
      [farmerDbId]
    );

    res.json(products);
  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({ message: 'Failed to get farmer products' });
  }
};

// Get product categories
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category FROM products WHERE is_available = true ORDER BY category'
    );

    res.json(categories.map(cat => cat.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to get categories' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getFarmerProducts,
  getCategories
};

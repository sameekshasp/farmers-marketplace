const express = require('express');
const router = express.Router();

const { authenticateToken, requireAdmin } = require('../middleware/auth');
const pool = require('../config/database');

// All admin routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

// GET /api/admin/dashboard — full product & sales stats for admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // ── Overall product counts ──────────────────────────────────────────────
    const [totalProducts] = await pool.execute(
      'SELECT COUNT(*) as total FROM products'
    );

    const [availableProducts] = await pool.execute(
      'SELECT COUNT(*) as total FROM products WHERE is_available = true AND quantity > 0'
    );

    const [unavailableProducts] = await pool.execute(
      'SELECT COUNT(*) as total FROM products WHERE is_available = false OR quantity = 0'
    );

    // ── Products by category ────────────────────────────────────────────────
    const [byCategory] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as total_products,
        SUM(quantity) as total_quantity,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        COUNT(CASE WHEN is_available = true AND quantity > 0 THEN 1 END) as available_count,
        COUNT(CASE WHEN is_available = false OR quantity = 0 THEN 1 END) as unavailable_count
      FROM products
      GROUP BY category
      ORDER BY category
    `);

    // ── Sold vs unsold (based on order_items) ──────────────────────────────
    const [soldProducts] = await pool.execute(`
      SELECT COUNT(DISTINCT oi.product_id) as sold_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status NOT IN ('cancelled')
    `);

    const [neverSoldProducts] = await pool.execute(`
      SELECT COUNT(*) as unsold_count
      FROM products p
      WHERE p.id NOT IN (
        SELECT DISTINCT oi.product_id
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status NOT IN ('cancelled')
      )
    `);

    // ── Per-product sold/unsold detail ─────────────────────────────────────
    const [productDetails] = await pool.execute(`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.price,
        p.quantity as current_stock,
        p.unit,
        p.is_available,
        f.farm_name,
        f.location as farm_location,
        COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') THEN oi.quantity ELSE 0 END), 0) as total_sold_qty,
        COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') THEN oi.quantity * oi.price ELSE 0 END), 0) as total_revenue
      FROM products p
      JOIN farmers f ON p.farmer_id = f.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      GROUP BY p.id, p.name, p.category, p.price, p.quantity, p.unit, p.is_available, f.farm_name, f.location
      ORDER BY p.category, p.name
    `);

    // ── Order stats ────────────────────────────────────────────────────────
    const [orderStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_price ELSE 0 END), 0) as total_revenue
      FROM orders
    `);

    // ── User stats ─────────────────────────────────────────────────────────
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'buyer' THEN 1 END) as total_buyers,
        COUNT(CASE WHEN role = 'farmer' THEN 1 END) as total_farmers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins
      FROM users
    `);

    res.json({
      overview: {
        total_products: totalProducts[0].total,
        available_products: availableProducts[0].total,
        unavailable_products: unavailableProducts[0].total,
        sold_products: soldProducts[0].sold_count,
        never_sold_products: neverSoldProducts[0].unsold_count,
      },
      by_category: byCategory,
      product_details: productDetails,
      orders: orderStats[0],
      users: userStats[0],
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to load admin dashboard data' });
  }
});

// GET /api/admin/products — paginated product list for admin
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 50));
    const offset = (parsedPage - 1) * parsedLimit;

    let query = `
      SELECT 
        p.*,
        f.farm_name,
        f.location as farm_location,
        u.name as farmer_name,
        COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') THEN oi.quantity ELSE 0 END), 0) as total_sold_qty,
        COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') THEN oi.quantity * oi.price ELSE 0 END), 0) as total_revenue
      FROM products p
      JOIN farmers f ON p.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE 1=1
    `;

    const params = [];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY p.id ORDER BY p.category, p.name LIMIT ${parsedLimit} OFFSET ${offset}`;

    const [products] = await pool.execute(query, params);

    // Count query
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
    const countParams = [];
    if (category) { countQuery += ' AND p.category = ?'; countParams.push(category); }
    if (search) { countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }

    const [countResult] = await pool.execute(countQuery, countParams);

    res.json({
      products,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parsedLimit),
      },
    });
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ message: 'Failed to get products' });
  }
});

module.exports = router;

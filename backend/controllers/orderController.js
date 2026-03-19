const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Create new order
const createOrder = async (req, res) => {
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
    const { 
      items, 
      delivery_address, 
      delivery_city, 
      delivery_state, 
      delivery_pincode,
      payment_method = 'cod' 
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Calculate total and validate products
      let totalPrice = 0;
      const orderItems = [];

      for (const item of items) {
        const [products] = await connection.execute(
          'SELECT id, price, quantity, farmer_id FROM products WHERE id = ? AND is_available = true',
          [item.productId]
        );

        if (products.length === 0) {
          await connection.rollback();
          return res.status(400).json({ 
            message: `Product with ID ${item.productId} not found or not available` 
          });
        }

        const product = products[0];

        if (product.quantity < item.quantity) {
          await connection.rollback();
          return res.status(400).json({ 
            message: `Insufficient quantity for product ${product.id}` 
          });
        }

        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          farmerId: product.farmerId
        });
      }

      // Create order
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (user_id, total_price, delivery_address, delivery_city, delivery_state, delivery_pincode, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, totalPrice, delivery_address, delivery_city, delivery_state, delivery_pincode, payment_method]
      );

      const orderId = orderResult.insertId;

      // Add order items
      for (const item of orderItems) {
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.productId, item.quantity, item.price]
        );

        // Update product quantity
        await connection.execute(
          'UPDATE products SET quantity = quantity - ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      // Clear cart
      await connection.execute(
        'DELETE FROM cart WHERE user_id = ?',
        [userId]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Order created successfully',
        orderId,
        totalPrice
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    let query = `SELECT o.*, COUNT(oi.id) as item_count, GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ' ', p.unit, ')') SEPARATOR ', ') as items_summary FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id WHERE o.user_id = ?`;

    const params = [userId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC';

    // Add pagination with strict validation
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, parseInt(limit) || 10);
    const offset = (parsedPage - 1) * parsedLimit;
    
    // Ensure values are valid integers for MySQL
    const safeLimit = parseInt(parsedLimit);
    const safeOffset = parseInt(offset);
    
    if (isNaN(safeLimit) || isNaN(safeOffset) || safeLimit < 1 || safeOffset < 0) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }
    
    query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const [orders] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
    const countParams = [userId];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Failed to get orders' });
  }
};

// Get single order details
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get order details
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const [orderItems] = await pool.execute(
      'SELECT oi.*, p.name, p.image_url, p.unit, f.farm_name, f.location as farm_location FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN farmers f ON p.farmer_id = f.id WHERE oi.order_id = ?',
      [id]
    );

    order.items = orderItems;

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to get order' });
  }
};

// Get farmer's orders
const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Get farmer profile
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [farmerId]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const farmerDbId = farmers[0].id;

    let query = `SELECT o.*, u.name as customer_name, u.phone as customer_phone, COUNT(oi.id) as item_count, SUM(oi.quantity * oi.price) as order_total FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id JOIN users u ON o.user_id = u.id WHERE p.farmer_id = ?`;

    const params = [farmerDbId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC';

    // Add pagination with strict validation
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, parseInt(limit) || 10);
    const offset = (parsedPage - 1) * parsedLimit;
    
    // Ensure values are valid integers for MySQL
    const safeLimit = parseInt(parsedLimit);
    const safeOffset = parseInt(offset);
    
    if (isNaN(safeLimit) || isNaN(safeOffset) || safeLimit < 1 || safeOffset < 0) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }
    
    query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const [orders] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT o.id) as total FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.farmer_id = ?';
    const countParams = [farmerDbId];

    if (status) {
      countQuery += ' AND o.status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({ message: 'Failed to get farmer orders' });
  }
};

// Update order status (farmer only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const farmerId = req.user.id;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // Get farmer profile
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [farmerId]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const farmerDbId = farmers[0].id;

    // Check if order contains products from this farmer
    const [orderCheck] = await pool.execute(
      'SELECT o.id FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE o.id = ? AND p.farmer_id = ? LIMIT 1',
      [id, farmerDbId]
    );

    if (orderCheck.length === 0) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }

    // Update order status
    const [result] = await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// Cancel order (buyer only)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get order details
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Check if order can be cancelled
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled once shipped or delivered' 
      });
    }

    // Start transaction to restore product quantities
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update order status
      await connection.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['cancelled', id]
      );

      // Restore product quantities
      const [orderItems] = await connection.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );

      for (const item of orderItems) {
        await connection.execute(
          'UPDATE products SET quantity = quantity + ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      await connection.commit();
      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getFarmerOrders,
  updateOrderStatus,
  cancelOrder
};

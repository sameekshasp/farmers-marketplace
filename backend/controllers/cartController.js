const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [cartItems] = await pool.execute(
      'SELECT c.id as cart_id, c.quantity, p.*, f.farm_name, f.location as farm_location, u.name as farmer_name FROM cart c JOIN products p ON c.product_id = p.id JOIN farmers f ON p.farmer_id = f.id JOIN users u ON f.user_id = u.id WHERE c.user_id = ? AND p.is_available = true ORDER BY c.created_at DESC',
      [userId]
    );

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      cartItems,
      total,
      itemCount: cartItems.length
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to get cart' });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
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
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and is available
    const [products] = await pool.execute(
      'SELECT id, quantity as available_quantity FROM products WHERE id = ? AND is_available = true',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or not available' });
    }

    const product = products[0];

    if (product.available_quantity < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient product quantity available' 
      });
    }

    // Check if item already exists in cart
    const [existingItems] = await pool.execute(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existingItems.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItems[0].quantity + quantity;

      if (product.available_quantity < newQuantity) {
        return res.status(400).json({ 
          message: 'Insufficient product quantity available' 
        });
      }

      await pool.execute(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
    } else {
      // Add new item to cart
      await pool.execute(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
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
    const { cartId } = req.params;
    const { quantity } = req.body;

    // Get cart item and product info
    const [cartItems] = await pool.execute(
      'SELECT c.id, c.product_id, c.quantity, p.quantity as available_quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ? AND p.is_available = true',
      [cartId, userId]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const cartItem = cartItems[0];

    if (cartItem.available_quantity < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient product quantity available' 
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await pool.execute(
        'DELETE FROM cart WHERE id = ? AND user_id = ?',
        [cartId, userId]
      );
    } else {
      // Update quantity
      await pool.execute(
        'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
        [quantity, cartId, userId]
      );
    }

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartId } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [cartId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.execute(
      'DELETE FROM cart WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};

// Get cart summary
const getCartSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.execute(
      'SELECT COUNT(*) as item_count, SUM(c.quantity * p.price) as total_price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ? AND p.is_available = true',
      [userId]
    );

    const summary = {
      itemCount: result[0].item_count || 0,
      totalPrice: result[0].total_price || 0
    };

    res.json(summary);
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ message: 'Failed to get cart summary' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
};

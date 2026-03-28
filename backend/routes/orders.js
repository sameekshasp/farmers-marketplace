const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { authenticateToken, requireFarmer, requireBuyerOrFarmer, requireAdmin } = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getFarmerOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');

// Validation rules
const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('delivery_address').trim().notEmpty().withMessage('Delivery address is required'),
  body('delivery_city').trim().notEmpty().withMessage('Delivery city is required'),
  body('delivery_state').trim().notEmpty().withMessage('Delivery state is required'),
  body('delivery_pincode').trim().matches(/^[0-9]{6}$/).withMessage('Invalid pincode format'),
  body('payment_method').optional().isIn(['cod', 'online', 'upi']).withMessage('Invalid payment method')
];

const updateStatusValidation = [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status')
];

// All order routes require authentication
router.use(authenticateToken);

// Buyer routes
router.post('/', requireBuyerOrFarmer, createOrderValidation, createOrder);
router.get('/user', requireBuyerOrFarmer, getUserOrders);
router.get('/user/:id', requireBuyerOrFarmer, getOrderById);
router.put('/user/:id/cancel', requireBuyerOrFarmer, cancelOrder);

// Farmer routes
router.get('/farmer', requireFarmer, getFarmerOrders);
router.put('/:id/status', requireFarmer, updateStatusValidation, updateOrderStatus);

// Admin routes
router.get('/admin', requireAdmin, getAllOrders);

module.exports = router;

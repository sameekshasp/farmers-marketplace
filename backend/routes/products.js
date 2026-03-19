const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { authenticateToken, requireFarmer } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getFarmerProducts,
  getCategories
} = require('../controllers/productController');

// Validation rules
const addProductValidation = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('unit').optional().isIn(['kg', 'g', 'pcs', 'liters', 'ml', 'dozen']).withMessage('Invalid unit'),
  body('harvest_date').optional().isISO8601().withMessage('Invalid harvest date format')
];

const updateProductValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('unit').optional().isIn(['kg', 'g', 'pcs', 'liters', 'ml', 'dozen']).withMessage('Invalid unit'),
  body('is_available').optional().isBoolean().withMessage('is_available must be a boolean')
];

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Farmer routes
router.get('/farmer/my-products', authenticateToken, requireFarmer, getFarmerProducts);
router.post('/', authenticateToken, requireFarmer, addProductValidation, addProduct);
router.put('/:id', authenticateToken, requireFarmer, updateProductValidation, updateProduct);
router.delete('/:id', authenticateToken, requireFarmer, deleteProduct);

module.exports = router;

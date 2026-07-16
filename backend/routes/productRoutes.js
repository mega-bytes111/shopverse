const express = require('express');
const { body } = require('express-validator');
const {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    addReview,
    getFeaturedProducts,
    getProductsByCategory
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation middleware
const productValidation = [
    body('name', 'Product name is required').trim().notEmpty(),
    body('description', 'Description is required').notEmpty(),
    body('price', 'Valid price is required').isFloat({ min: 0 }),
    body('category', 'Category is required').notEmpty(),
    body('brand', 'Brand is required').notEmpty(),
    body('stock', 'Valid stock is required').isInt({ min: 0 })
];

const reviewValidation = [
    body('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
    body('comment', 'Comment is required').trim().notEmpty()
];

// Public Routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProduct);

// Protected Routes (Admin only)
router.post('/', protect, admin, upload.array('images', 5), productValidation, createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Review Routes (Protected)
router.post('/:id/reviews', protect, reviewValidation, addReview);

module.exports = router;
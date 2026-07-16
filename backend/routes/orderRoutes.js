const express = require('express');
const { body } = require('express-validator');
const {
    createOrder,
    getMyOrders,
    getOrder,
    updateOrder,
    cancelOrder,
    getAllOrders
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const orderValidation = [
    body('orderItems', 'Order items are required').isArray({ min: 1 }),
    body('shippingAddress', 'Shipping address is required').notEmpty(),
    body('paymentMethod', 'Payment method is required').notEmpty(),
    body('totalPrice', 'Total price is required').isFloat({ min: 0 })
];

// Protected Routes (User)
router.post('/', protect, orderValidation, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Protected Routes (Admin only)
router.get('/', protect, admin, getAllOrders);
router.put('/:id', protect, admin, updateOrder);

module.exports = router;
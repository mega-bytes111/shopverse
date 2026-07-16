const express = require('express');
const { body } = require('express-validator');
const {
    createRazorpayOrder,
    verifyRazorpayPayment,
    createStripePaymentIntent,
    confirmStripePayment,
    getPaymentStatus
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Razorpay Routes
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// Stripe Routes
router.post('/stripe', protect, createStripePaymentIntent);
router.post('/stripe/confirm', protect, confirmStripePayment);

// Payment Status
router.get('/status/:orderId', protect, getPaymentStatus);

module.exports = router;
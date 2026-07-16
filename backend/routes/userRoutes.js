const express = require('express');
const { body } = require('express-validator');
const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    addAddress,
    updateAddress,
    deleteAddress,
    addToWishlist,
    removeFromWishlist,
    getWishlist
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const addressValidation = [
    body('fullName', 'Full name is required').trim().notEmpty(),
    body('phone', 'Phone is required').notEmpty(),
    body('addressLine1', 'Address is required').trim().notEmpty(),
    body('city', 'City is required').trim().notEmpty(),
    body('state', 'State is required').trim().notEmpty(),
    body('pincode', 'Pincode is required').notEmpty()
];

// Protected Routes (User)
router.post('/addresses', protect, addressValidation, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Wishlist Routes
router.post('/wishlist/:productId', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);
router.get('/wishlist', protect, getWishlist);

// Protected Routes (Admin only)
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUser);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
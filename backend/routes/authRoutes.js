const express = require('express');
const { body } = require('express-validator');
const {
    register,
    login,
    getMe,
    logout,
    updateProfile,
    changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('name', 'Name is required').trim().notEmpty(),
    body('email', 'Valid email is required').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('confirmPassword', 'Confirm password is required').notEmpty()
];

const loginValidation = [
    body('email', 'Valid email is required').isEmail(),
    body('password', 'Password is required').notEmpty()
];

// Public Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected Routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updateprofile', protect, updateProfile);
router.put('/changepassword', protect, changePassword);

module.exports = router;
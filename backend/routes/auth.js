const express = require('express');
const { authController } = require('../controllers');
const { authenticateToken, authRateLimit, asyncHandler } = require('../middleware');

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authRateLimit, asyncHandler(authController.registerUser));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authRateLimit, asyncHandler(authController.loginUser));

// @desc    Request password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', authRateLimit, asyncHandler(authController.forgotPassword));

// @desc    Reset password with token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put('/reset-password/:token', authRateLimit, asyncHandler(authController.resetPassword));

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
router.post('/admin/login', authRateLimit, asyncHandler(authController.adminLogin));

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', authenticateToken, asyncHandler(authController.getUserProfile));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', authenticateToken, asyncHandler(authController.updateUserProfile));

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', authenticateToken, authRateLimit, asyncHandler(authController.changePassword));

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', authenticateToken, asyncHandler(authController.verifyToken));

module.exports = router;
const express = require('express');
const { reviewController } = require('../controllers');
const { authenticateToken, requireAdmin, generalRateLimit, asyncHandler } = require('../middleware');

const router = express.Router();

// PUBLIC ROUTES

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
router.get('/', asyncHandler(reviewController.getAllReviews));

// @desc    Get review statistics
// @route   GET /api/reviews/stats
// @access  Public
router.get('/stats', asyncHandler(reviewController.getReviewStats));

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
router.get('/:id', asyncHandler(reviewController.getReviewById));

// @desc    Get reviews by user
// @route   GET /api/reviews/user/:userId
// @access  Public
router.get('/user/:userId', asyncHandler(reviewController.getReviewsByUser));

// @desc    Get review by booking
// @route   GET /api/reviews/booking/:bookingId
// @access  Public
router.get('/booking/:bookingId', asyncHandler(reviewController.getReviewByBooking));

// USER ROUTES

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (User)
router.post('/', authenticateToken, generalRateLimit, asyncHandler(reviewController.createReview));

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (User - own review only)
router.put('/:id', authenticateToken, generalRateLimit, asyncHandler(reviewController.updateReview));

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (User - own review only, or Admin)
router.delete('/:id', authenticateToken, asyncHandler(reviewController.deleteReview));

module.exports = router;

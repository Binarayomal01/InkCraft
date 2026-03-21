const express = require('express');
const { bookingController } = require('../controllers');
const { authenticateToken, requireAdmin, generalRateLimit, asyncHandler } = require('../middleware');

const router = express.Router();

// USER ROUTES

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
router.post('/', authenticateToken, generalRateLimit, asyncHandler(bookingController.createBooking));

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
router.get('/my-bookings', authenticateToken, asyncHandler(bookingController.getUserBookings));

// @desc    Get booking by ID (user's own booking)
// @route   GET /api/bookings/:id
// @access  Private (User)
router.get('/:id', authenticateToken, asyncHandler(bookingController.getBookingById));

// @desc    Update a booking (user can only update pending bookings)
// @route   PUT /api/bookings/:id
// @access  Private (User)
router.put('/:id', authenticateToken, generalRateLimit, asyncHandler(bookingController.updateBooking));

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private (User)
router.delete('/:id', authenticateToken, asyncHandler(bookingController.cancelBooking));

// ADMIN ROUTES

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings/admin/all
// @access  Private (Admin)
router.get('/admin/all', authenticateToken, requireAdmin, asyncHandler(bookingController.getAllBookings));

// @desc    Update booking status (admin only)
// @route   PUT /api/bookings/admin/:id/status
// @access  Private (Admin)
router.put('/admin/:id/status', authenticateToken, requireAdmin, generalRateLimit, asyncHandler(bookingController.updateBookingStatus));

// @desc    Get booking statistics (admin only)
// @route   GET /api/bookings/admin/stats
// @access  Private (Admin)
router.get('/admin/stats', authenticateToken, requireAdmin, asyncHandler(bookingController.getBookingStats));

module.exports = router;
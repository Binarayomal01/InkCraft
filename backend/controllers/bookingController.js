const mongoose = require('mongoose');
const { Booking, TattooDesign } = require('../models');
const {
  sendBookingConfirmationEmail,
  sendBookingStatusEmail
} = require('../services/emailService');

const BOOKING_POPULATE_OPTIONS = [
  { path: 'userId', select: 'name email phone' },
  {
    path: 'tattooDesignId',
    select: 'title description style size imageUrl aiGenerated prompt createdAt'
  }
];

const getLinkedUserDesign = async (tattooDesignId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(tattooDesignId)) {
    return null;
  }

  return TattooDesign.findOne({
    _id: tattooDesignId,
    createdBy: userId,
    isActive: true
  }).select('_id title description style size imageUrl aiGenerated prompt createdAt');
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
  try {
    const {
      tattooIdea,
      tattooStyle,
      bodyPlacement,
      size,
      preferredDate,
      preferredTime,
      notes,
      tattooDesignId
    } = req.body;

    // Validate required fields
    const requiredFields = ['tattooIdea', 'tattooStyle', 'bodyPlacement', 'size', 'preferredDate', 'preferredTime'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Check if preferred date is in the future
    const bookingDate = new Date(preferredDate);
    if (bookingDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Preferred date must be in the future'
      });
    }

    // Check for double booking - prevent booking same date/time slot
    const existingBooking = await Booking.findOne({
      preferredDate: bookingDate,
      preferredTime,
      status: { $in: ['pending', 'approved'] } // Only check active bookings
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different date or time.'
      });
    }

    let linkedDesign = null;
    if (tattooDesignId !== undefined && tattooDesignId !== null && tattooDesignId !== '') {
      linkedDesign = await getLinkedUserDesign(tattooDesignId, req.user.userId);

      if (!linkedDesign) {
        return res.status(400).json({
          success: false,
          message: 'Selected design was not found in your saved designs'
        });
      }
    }

    // Create booking
    const booking = new Booking({
      userId: req.user.userId,
      tattooIdea,
      tattooStyle,
      bodyPlacement,
      size,
      preferredDate: bookingDate,
      preferredTime,
      notes: notes || '',
      tattooDesignId: linkedDesign ? linkedDesign._id : undefined,
      status: 'pending'
    });

    await booking.save();

    // Populate user info for response
    await booking.populate(BOOKING_POPULATE_OPTIONS);

    const bookingUser = booking.userId;
    if (bookingUser && bookingUser.email) {
      try {
        await sendBookingConfirmationEmail({
          to: bookingUser.email,
          name: bookingUser.name,
          booking
        });
      } catch (emailError) {
        console.error('Booking confirmation email error:', emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
const getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query filter
    const filter = { userId: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate(BOOKING_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / limit);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBookings,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};

// @desc    Get booking by ID (for user's own bookings)
// @route   GET /api/bookings/:id
// @access  Private (User)
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate(BOOKING_POPULATE_OPTIONS);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    res.json({
      success: true,
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
};

// @desc    Update a booking (user can only update pending bookings)
// @route   PUT /api/bookings/:id
// @access  Private (User)
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    // Only allow updates to pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending bookings'
      });
    }

    const {
      tattooIdea,
      tattooStyle,
      bodyPlacement,
      size,
      preferredDate,
      preferredTime,
      notes,
      tattooDesignId
    } = req.body;

    // Update fields if provided
    if (tattooIdea !== undefined) booking.tattooIdea = tattooIdea;
    if (tattooStyle !== undefined) booking.tattooStyle = tattooStyle;
    if (bodyPlacement !== undefined) booking.bodyPlacement = bodyPlacement;
    if (size !== undefined) booking.size = size;
    if (notes !== undefined) booking.notes = notes;

    if (tattooDesignId !== undefined) {
      if (tattooDesignId === null || tattooDesignId === '') {
        booking.tattooDesignId = undefined;
      } else {
        const linkedDesign = await getLinkedUserDesign(tattooDesignId, req.user.userId);

        if (!linkedDesign) {
          return res.status(400).json({
            success: false,
            message: 'Selected design was not found in your saved designs'
          });
        }

        booking.tattooDesignId = linkedDesign._id;
      }
    }
    
    // Check for date/time changes and validate against double booking
    const dateChanged = preferredDate !== undefined;
    const timeChanged = preferredTime !== undefined;
    
    if (dateChanged || timeChanged) {
      const newDate = dateChanged ? new Date(preferredDate) : booking.preferredDate;
      const newTime = timeChanged ? preferredTime : booking.preferredTime;
      
      // Check if new date is in the future
      if (dateChanged && newDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Preferred date must be in the future'
        });
      }
      
      // Check for double booking (excluding current booking)
      const existingBooking = await Booking.findOne({
        _id: { $ne: booking._id }, // Exclude current booking
        preferredDate: newDate,
        preferredTime: newTime,
        status: { $in: ['pending', 'approved'] }
      });
      
      if (existingBooking) {
        return res.status(409).json({
          success: false,
          message: 'This time slot is already booked. Please choose a different date or time.'
        });
      }
      
      // Update the fields
      if (dateChanged) booking.preferredDate = newDate;
      if (timeChanged) booking.preferredTime = newTime;
    }

    await booking.save();
    await booking.populate(BOOKING_POPULATE_OPTIONS);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Update booking error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating booking'
    });
  }
};

// @desc    Cancel a booking (user can only cancel pending or approved bookings)
// @route   DELETE /api/bookings/:id
// @access  Private (User)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    // Check if booking can be cancelled
    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking with current status'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking'
    });
  }
};

// ADMIN CONTROLLER METHODS

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings/admin/all
// @access  Private (Admin)
const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    // Build query filter
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const bookings = await Booking.find(filter)
      .populate(BOOKING_POPULATE_OPTIONS)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / limit);

    // Get status counts for dashboard
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBookings,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        statusStats
      }
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};

// @desc    Update booking status (admin only)
// @route   PUT /api/bookings/admin/:id/status
// @access  Private (Admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNotes, estimatedDuration, estimatedPrice, rejectionReason } = req.body;

    const booking = await Booking.findById(req.params.id).populate(BOOKING_POPULATE_OPTIONS);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // If rejecting, require rejection reason
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting a booking'
      });
    }

    const previousStatus = booking.status;

    // Update booking
    booking.status = status;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;
    if (estimatedDuration !== undefined) booking.estimatedDuration = estimatedDuration;
    if (estimatedPrice !== undefined) booking.estimatedPrice = estimatedPrice;
    if (rejectionReason !== undefined) booking.rejectionReason = rejectionReason;

    await booking.save();

    const bookingUser = booking.userId;
    const statusChanged = previousStatus !== booking.status;

    if (statusChanged && bookingUser && bookingUser.email) {
      try {
        await sendBookingStatusEmail({
          to: bookingUser.email,
          name: bookingUser.name,
          booking
        });
      } catch (emailError) {
        console.error('Booking status email error:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating booking status'
    });
  }
};

// @desc    Get booking statistics (admin only)
// @route   GET /api/bookings/admin/stats
// @access  Private (Admin)
const getBookingStats = async (req, res) => {
  try {
    // Get total bookings
    const totalBookings = await Booking.countDocuments();

    // Get bookings by status
    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get bookings by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get popular tattoo styles
    const styleStats = await Booking.aggregate([
      {
        $group: {
          _id: '$tattooStyle',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Calculate average estimated price
    const priceStats = await Booking.aggregate([
      {
        $match: { estimatedPrice: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$estimatedPrice' },
          minPrice: { $min: '$estimatedPrice' },
          maxPrice: { $max: '$estimatedPrice' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        statusStats: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        monthlyStats,
        styleStats,
        priceStats: priceStats.length > 0 ? priceStats[0] : null
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking statistics'
    });
  }
};

module.exports = {
  // User methods
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  
  // Admin methods
  getAllBookings,
  updateBookingStatus,
  getBookingStats
};
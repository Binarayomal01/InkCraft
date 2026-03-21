// Central export file for all routes
const authRoutes = require('./auth');
const bookingRoutes = require('./bookings');
const tattooDesignRoutes = require('./tattooDesigns');
const chatRoutes = require('./chat');
const adminRoutes = require('./admin');
const reviewRoutes = require('./reviews');

module.exports = {
  authRoutes,
  bookingRoutes,
  tattooDesignRoutes,
  chatRoutes,
  adminRoutes,
  reviewRoutes
};
// Central export file for all controllers
const authController = require('./authController');
const bookingController = require('./bookingController');
const tattooDesignController = require('./tattooDesignController');
const chatController = require('./chatController');
const reviewController = require('./reviewController');

module.exports = {
  authController,
  bookingController,
  tattooDesignController,
  chatController,
  reviewController
};
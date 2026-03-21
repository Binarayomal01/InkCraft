// Central export file for all middleware
const auth = require('./auth');
const { errorHandler, notFound, asyncHandler } = require('./errorHandler');

module.exports = {
  ...auth,
  errorHandler,
  notFound,
  asyncHandler
};
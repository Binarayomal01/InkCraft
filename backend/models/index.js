// Central export file for all models
const User = require('./User');
const Booking = require('./Booking');
const TattooDesign = require('./TattooDesign');
const ChatMessage = require('./ChatMessage');
const Review = require('./Review');

module.exports = {
  User,
  Booking,
  TattooDesign,
  ChatMessage,
  Review
};
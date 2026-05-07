const express = require('express');
const { chatController } = require('../controllers');
const { authenticateToken, optionalAuth, requireAdmin, chatRateLimit, generalRateLimit, asyncHandler } = require('../middleware');

const router = express.Router();

// PUBLIC ROUTES

// @desc    Send message to AI chatbot
// @route   POST /api/chat
// @access  Public (with optional auth)
router.post('/', optionalAuth, chatRateLimit, asyncHandler(chatController.sendMessage));

// @desc    Get chat history for session
// @route   GET /api/chat/history/:sessionId
// @access  Public (with optional auth for security when logged in)
router.get('/history/:sessionId', optionalAuth, asyncHandler(chatController.getChatHistory));

// @desc    Rate chatbot response as helpful/not helpful
// @route   POST /api/chat/:messageId/rate
// @access  Public (with optional auth for security when logged in)
router.post('/:messageId/rate', optionalAuth, generalRateLimit, asyncHandler(chatController.rateResponse));

// @desc    Get quick reply suggestions
// @route   GET /api/chat/suggestions
// @access  Public
router.get('/suggestions', asyncHandler(chatController.getQuickReplies));

// USER ROUTES

// @desc    Get user's chat sessions (for logged in users)
// @route   GET /api/chat/my-sessions
// @access  Private
router.get('/my-sessions', authenticateToken, asyncHandler(chatController.getUserSessions));

// ADMIN ROUTES

// @desc    Get chat analytics (admin only)
// @route   GET /api/chat/admin/analytics
// @access  Private (Admin)
router.get('/admin/analytics', authenticateToken, requireAdmin, asyncHandler(chatController.getChatAnalytics));

// @desc    Get chat quality summary (admin only)
// @route   GET /api/chat/admin/quality-summary
// @access  Private (Admin)
router.get('/admin/quality-summary', authenticateToken, requireAdmin, asyncHandler(chatController.getChatQualitySummary));

// @desc    Get all chat messages (admin only)
// @route   GET /api/chat/admin/messages
// @access  Private (Admin)
router.get('/admin/messages', authenticateToken, requireAdmin, asyncHandler(chatController.getAllMessages));

module.exports = router;
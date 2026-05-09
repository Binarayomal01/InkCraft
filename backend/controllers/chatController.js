const { ChatMessage } = require('../models');
const crypto = require('crypto');

// Generate session ID for anonymous users
const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

const DEFAULT_SUMMARY_DAYS = 7;
const DEFAULT_LOW_CONFIDENCE_THRESHOLD = 0.62;
const DEFAULT_TOP_QUERY_LIMIT = 10;
const DEFAULT_SAMPLE_LIMIT = 20;

const parseBoundedInt = (value, fallback, min, max) => {
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    return fallback;
  }

  return Math.min(Math.max(parsedValue, min), max);
};

const parseBoundedFloat = (value, fallback, min, max) => {
  const parsedValue = Number.parseFloat(value);
  if (Number.isNaN(parsedValue)) {
    return fallback;
  }

  return Math.min(Math.max(parsedValue, min), max);
};

const toPercentage = (numerator, denominator) => {
  if (!denominator) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(2));
};

// @desc    Send message to AI chatbot
// @route   POST /api/chat
// @access  Public
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId: providedSessionId } = req.body;

    // Validate message
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 1000 characters'
      });
    }

    // Generate or use session ID
    const sessionId = providedSessionId || generateSessionId();
    const userId = req.user ? req.user.userId : null;

    const sessionContextFilter = { sessionId };
    if (userId) {
      sessionContextFilter.userId = userId;
    }

    const previousSessionMessage = await ChatMessage.findOne(sessionContextFilter)
      .sort({ createdAt: -1 })
      .select('messageType confidence keywords');

    const sessionContext = previousSessionMessage
      ? {
          lastIntent: previousSessionMessage.messageType,
          lastConfidence: previousSessionMessage.confidence,
          lastKeywords: previousSessionMessage.keywords || []
        }
      : {};

    // Generate AI response using rule-based logic
    const aiResponse = ChatMessage.generateResponse(message, sessionContext);

    // Save chat message
    const chatMessage = new ChatMessage({
      userId,
      sessionId,
      message: message.trim(),
      response: aiResponse.response,
      messageType: aiResponse.type,
      confidence: aiResponse.confidence,
      keywords: aiResponse.keywords,
      followUpSuggestions: aiResponse.suggestions || [],
      metadata: {
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || '',
        referrer: req.get('Referrer') || ''
      }
    });

    await chatMessage.save();

    res.json({
      success: true,
      data: {
        messageId: chatMessage._id,
        sessionId,
        response: aiResponse.response,
        messageType: aiResponse.type,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions || [],
        timestamp: chatMessage.createdAt
      }
    });

  } catch (error) {
    console.error('Send message error:', error);

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
      message: 'Server error while processing message'
    });
  }
};

// @desc    Get chat history for session
// @route   GET /api/chat/history/:sessionId
// @access  Public
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Build filter - if user is logged in, include userId check for security
    const filter = { sessionId };
    if (req.user) {
      filter.userId = req.user.userId;
    }

    const messages = await ChatMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('message response messageType confidence followUpSuggestions createdAt wasHelpful');

    const totalMessages = await ChatMessage.countDocuments(filter);
    const totalPages = Math.ceil(totalMessages / limit);

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalMessages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat history'
    });
  }
};

// @desc    Rate chatbot response as helpful/not helpful
// @route   POST /api/chat/:messageId/rate
// @access  Public
const rateResponse = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { helpful } = req.body;

    if (typeof helpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Helpful rating must be true or false'
      });
    }

    // Build filter - if user is logged in, include userId check for security
    const filter = { _id: messageId };
    if (req.user) {
      filter.userId = req.user.userId;
    }

    const chatMessage = await ChatMessage.findOne(filter);

    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: 'Chat message not found or unauthorized'
      });
    }

    chatMessage.wasHelpful = helpful;
    await chatMessage.save();

    res.json({
      success: true,
      message: 'Rating saved successfully',
      data: {
        messageId,
        wasHelpful: helpful
      }
    });

  } catch (error) {
    console.error('Rate response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rating response'
    });
  }
};

// @desc    Get quick reply suggestions
// @route   GET /api/chat/suggestions
// @access  Public
const getQuickReplies = async (req, res) => {
  try {
    const suggestions = [
      {
        category: 'Booking',
        replies: [
          'How do I book a tattoo appointment?',
          'What do I need for my appointment?',
          'Can I reschedule my booking?',
          'What is your cancellation policy?'
        ]
      },
      {
        category: 'Services',
        replies: [
          'What tattoo styles do you offer?',
          'How much do tattoos cost?',
          'Do you offer consultations?',
          'What is your shop minimum?'
        ]
      },
      {
        category: 'Aftercare',
        replies: [
          'How do I care for my new tattoo?',
          'When can I go swimming after getting a tattoo?',
          'What are signs of tattoo infection?',
          'Can I exercise after getting a tattoo?'
        ]
      },
      {
        category: 'Studio Info',
        replies: [
          'What are your hours?',
          'Where are you located?',
          'Do you accept walk-ins?',
          'What safety measures do you follow?'
        ]
      }
    ];

    res.json({
      success: true,
      data: {
        suggestions
      }
    });

  } catch (error) {
    console.error('Get quick replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suggestions'
    });
  }
};

// @desc    Get user's chat sessions (for logged in users)
// @route   GET /api/chat/my-sessions
// @access  Private
const getUserSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get unique sessions for the user
    const sessions = await ChatMessage.aggregate([
      {
        $match: { userId: req.user.userId }
      },
      {
        $group: {
          _id: '$sessionId',
          lastMessage: { $last: '$message' },
          lastResponse: { $last: '$response' },
          messageCount: { $sum: 1 },
          lastActivity: { $max: '$createdAt' },
          firstActivity: { $min: '$createdAt' }
        }
      },
      {
        $sort: { lastActivity: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    const totalSessions = await ChatMessage.distinct('sessionId', { userId: req.user.userId }).length;
    const totalPages = Math.ceil(totalSessions / limit);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSessions,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sessions'
    });
  }
};

// ADMIN CONTROLLER METHODS

// @desc    Get chat analytics (admin only)
// @route   GET /api/chat/admin/analytics
// @access  Private (Admin)
const getChatAnalytics = async (req, res) => {
  try {
    // Total messages
    const totalMessages = await ChatMessage.countDocuments();

    // Messages by type
    const messageTypes = await ChatMessage.aggregate([
      {
        $group: {
          _id: '$messageType',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Helpfulness ratings
    const helpfulnessStats = await ChatMessage.aggregate([
      {
        $match: { wasHelpful: { $ne: null } }
      },
      {
        $group: {
          _id: '$wasHelpful',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily message counts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await ChatMessage.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Popular keywords
    const keywordStats = await ChatMessage.aggregate([
      {
        $unwind: '$keywords'
      },
      {
        $group: {
          _id: '$keywords',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // User vs Anonymous messages
    const userStats = await ChatMessage.aggregate([
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$userId', null] }, 'anonymous', 'registered']
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Session statistics
    const sessionStats = await ChatMessage.aggregate([
      {
        $group: {
          _id: '$sessionId',
          messageCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          avgMessagesPerSession: { $avg: '$messageCount' },
          maxMessagesPerSession: { $max: '$messageCount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalMessages,
        messageTypes,
        helpfulnessStats: helpfulnessStats.reduce((acc, item) => {
          acc[item._id ? 'helpful' : 'notHelpful'] = item.count;
          return acc;
        }, { helpful: 0, notHelpful: 0 }),
        dailyStats,
        keywordStats,
        userStats: userStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, { anonymous: 0, registered: 0 }),
        sessionStats: sessionStats.length > 0 ? sessionStats[0] : null
      }
    });

  } catch (error) {
    console.error('Get chat analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
};

// @desc    Get lightweight chatbot quality summary (admin only)
// @route   GET /api/chat/admin/quality-summary
// @access  Private (Admin)
const getChatQualitySummary = async (req, res) => {
  try {
    const days = parseBoundedInt(req.query.days, DEFAULT_SUMMARY_DAYS, 1, 90);
    const lowConfidenceThreshold = parseBoundedFloat(
      req.query.lowConfidenceThreshold,
      DEFAULT_LOW_CONFIDENCE_THRESHOLD,
      0,
      1
    );
    const topLimit = parseBoundedInt(req.query.topLimit, DEFAULT_TOP_QUERY_LIMIT, 1, 50);
    const sampleLimit = parseBoundedInt(req.query.sampleLimit, DEFAULT_SAMPLE_LIMIT, 1, 100);

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const baseMatch = { createdAt: { $gte: sinceDate } };
    const unresolvedMatch = {
      ...baseMatch,
      $or: [
        { messageType: 'unknown' },
        { confidence: { $lt: lowConfidenceThreshold } }
      ]
    };

    const [
      totalMessages,
      qualityStatsResult,
      topUnresolvedQueriesResult,
      recentUnresolvedSamples
    ] = await Promise.all([
      ChatMessage.countDocuments(baseMatch),
      ChatMessage.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            unknownQueries: {
              $sum: {
                $cond: [{ $eq: ['$messageType', 'unknown'] }, 1, 0]
              }
            },
            lowConfidenceQueries: {
              $sum: {
                $cond: [{ $lt: ['$confidence', lowConfidenceThreshold] }, 1, 0]
              }
            },
            unresolvedQueries: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$messageType', 'unknown'] },
                      { $lt: ['$confidence', lowConfidenceThreshold] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            avgConfidence: { $avg: '$confidence' },
            ratedMessages: {
              $sum: {
                $cond: [{ $ne: ['$wasHelpful', null] }, 1, 0]
              }
            },
            notHelpfulRatings: {
              $sum: {
                $cond: [{ $eq: ['$wasHelpful', false] }, 1, 0]
              }
            }
          }
        }
      ]),
      ChatMessage.aggregate([
        { $match: unresolvedMatch },
        {
          $project: {
            normalizedMessage: {
              $trim: {
                input: { $toLower: '$message' }
              }
            },
            messageType: 1,
            confidence: 1,
            createdAt: 1
          }
        },
        {
          $match: {
            normalizedMessage: { $ne: '' }
          }
        },
        {
          $group: {
            _id: '$normalizedMessage',
            count: { $sum: 1 },
            unknownCount: {
              $sum: {
                $cond: [{ $eq: ['$messageType', 'unknown'] }, 1, 0]
              }
            },
            lowConfidenceCount: {
              $sum: {
                $cond: [{ $lt: ['$confidence', lowConfidenceThreshold] }, 1, 0]
              }
            },
            avgConfidence: { $avg: '$confidence' },
            latestSeen: { $max: '$createdAt' }
          }
        },
        { $sort: { count: -1, latestSeen: -1 } },
        { $limit: topLimit },
        {
          $project: {
            _id: 0,
            query: '$_id',
            count: 1,
            unknownCount: 1,
            lowConfidenceCount: 1,
            avgConfidence: 1,
            latestSeen: 1
          }
        }
      ]),
      ChatMessage.find(unresolvedMatch)
        .sort({ createdAt: -1 })
        .limit(sampleLimit)
        .select('message response messageType confidence keywords wasHelpful createdAt sessionId')
    ]);

    const qualityStats = qualityStatsResult[0] || {
      unknownQueries: 0,
      lowConfidenceQueries: 0,
      unresolvedQueries: 0,
      avgConfidence: 0,
      ratedMessages: 0,
      notHelpfulRatings: 0
    };

    const topUnresolvedQueries = topUnresolvedQueriesResult.map((item) => ({
      query: item.query,
      count: item.count,
      unknownCount: item.unknownCount,
      lowConfidenceCount: item.lowConfidenceCount,
      avgConfidence: Number((item.avgConfidence || 0).toFixed(3)),
      latestSeen: item.latestSeen
    }));

    const now = new Date();
    res.json({
      success: true,
      data: {
        period: {
          days,
          since: sinceDate,
          until: now
        },
        thresholds: {
          lowConfidence: lowConfidenceThreshold
        },
        totals: {
          totalMessages,
          unknownQueries: qualityStats.unknownQueries,
          lowConfidenceQueries: qualityStats.lowConfidenceQueries,
          unresolvedQueries: qualityStats.unresolvedQueries,
          unknownRatePct: toPercentage(qualityStats.unknownQueries, totalMessages),
          lowConfidenceRatePct: toPercentage(qualityStats.lowConfidenceQueries, totalMessages),
          unresolvedRatePct: toPercentage(qualityStats.unresolvedQueries, totalMessages),
          avgConfidence: Number((qualityStats.avgConfidence || 0).toFixed(3)),
          ratedMessages: qualityStats.ratedMessages,
          notHelpfulRatings: qualityStats.notHelpfulRatings
        },
        topUnresolvedQueries,
        recentUnresolvedSamples
      }
    });

  } catch (error) {
    console.error('Get chat quality summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quality summary'
    });
  }
};

// @desc    Get all chat messages (admin only)
// @route   GET /api/chat/admin/messages
// @access  Private (Admin)
const getAllMessages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      messageType, 
      dateFrom, 
      dateTo,
      helpful,
      sessionId 
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (messageType && messageType !== 'all') {
      filter.messageType = messageType;
    }
    
    if (sessionId) {
      filter.sessionId = sessionId;
    }

    if (helpful !== undefined) {
      filter.wasHelpful = helpful === 'true' ? true : helpful === 'false' ? false : null;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const messages = await ChatMessage.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await ChatMessage.countDocuments(filter);
    const totalPages = Math.ceil(totalMessages / limit);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalMessages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
};

module.exports = {
  // Public methods
  sendMessage,
  getChatHistory,
  rateResponse,
  getQuickReplies,
  
  // User methods
  getUserSessions,
  
  // Admin methods
  getChatAnalytics,
  getChatQualitySummary,
  getAllMessages
};
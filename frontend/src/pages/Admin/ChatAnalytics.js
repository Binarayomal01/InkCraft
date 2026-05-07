import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { useTheme } from '../../context/ThemeContext';
import { chatService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Modal from '../../components/UI/Modal';
import Select from '../../components/UI/Select';
import Card from '../../components/UI/Card';

const ChatAnalytics = () => {
  const [messages, setMessages] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    activeConversations: 0,
    avgResponseTime: null,
    positiveSentimentPct: 0,
    topQuestions: [],
    hourlyDistribution: [],
    categoryBreakdown: []
  });
  const [qualitySummary, setQualitySummary] = useState({
    period: { days: 7 },
    thresholds: { lowConfidence: 0.62 },
    totals: {
      totalMessages: 0,
      unknownQueries: 0,
      lowConfidenceQueries: 0,
      unresolvedQueries: 0,
      unknownRatePct: 0,
      lowConfidenceRatePct: 0,
      unresolvedRatePct: 0,
      avgConfidence: 0,
      ratedMessages: 0,
      notHelpfulRatings: 0
    },
    topUnresolvedQueries: [],
    recentUnresolvedSamples: []
  });
  
  const { loading, error, request, clearError } = useApi();
  const { isDark } = useTheme();

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  // Mock chat data for demonstration
  const mockMessages = useMemo(() => [
    {
      _id: '1',
      user: { _id: 'u1', name: 'John Smith', email: 'john@email.com' },
      message: 'Hi, I want to get my first tattoo. Any advice?',
      response: 'Welcome to our studio! For your first tattoo, I recommend starting with something small and meaningful. What style interests you?',
      category: 'first-time',
      sentiment: 'neutral',
      responseTime: 120, // seconds
      createdAt: '2026-02-10T10:30:00Z'
    },
    {
      _id: '2',
      user: { _id: 'u2', name: 'Sarah Johnson', email: 'sarah@email.com' },
      message: 'How much does a small watercolor tattoo cost?',
      response: 'Small watercolor tattoos typically range from $100-300 depending on complexity and size. Would you like to schedule a consultation?',
      category: 'pricing',
      sentiment: 'positive',
      responseTime: 85,
      createdAt: '2026-02-10T14:20:00Z'
    },
    {
      _id: '3',
      user: { _id: 'u3', name: 'Mike Wilson', email: 'mike@email.com' },
      message: 'Do you do cover-ups for old tattoos?',
      response: 'Yes, we specialize in cover-ups! Our artists are experienced in transforming old tattoos into beautiful new designs. Book a consultation to discuss your options.',
      category: 'services',
      sentiment: 'neutral',
      responseTime: 95,
      createdAt: '2026-02-09T16:45:00Z'
    },
    {
      _id: '4',
      user: { _id: 'u4', name: 'Lisa Chen', email: 'lisa@email.com' },
      message: 'I love the geometric designs on your website!',
      response: 'Thank you! Our artists create amazing geometric pieces. Would you like to see more examples or book a consultation?',
      category: 'compliment',
      sentiment: 'positive',
      responseTime: 60,
      createdAt: '2026-02-09T11:15:00Z'
    },
    {
      _id: '5',
      user: { _id: 'u5', name: 'Alex Rodriguez', email: 'alex@email.com' },
      message: "What's your aftercare process?",
      response: 'We provide detailed aftercare instructions including cleaning guidelines, healing timeline, and products to use. Proper aftercare is crucial for the best results!',
      category: 'aftercare',
      sentiment: 'neutral',
      responseTime: 110,
      createdAt: '2026-02-08T13:30:00Z'
    }
  ], []);

  // Mock analytics data
  const mockAnalytics = useMemo(() => ({
    totalMessages: 247,
    activeConversations: 23,
    avgResponseTime: 92,
    topQuestions: [
      { question: 'Pricing information', count: 45 },
      { question: 'First tattoo advice', count: 38 },
      { question: 'Aftercare instructions', count: 32 },
      { question: 'Design consultations', count: 28 },
      { question: 'Cover-up services', count: 22 }
    ],
    hourlyDistribution: [
      { hour: '9 AM', messages: 8 },
      { hour: '10 AM', messages: 12 },
      { hour: '11 AM', messages: 18 },
      { hour: '12 PM', messages: 25 },
      { hour: '1 PM', messages: 22 },
      { hour: '2 PM', messages: 30 },
      { hour: '3 PM', messages: 28 },
      { hour: '4 PM', messages: 24 },
      { hour: '5 PM', messages: 20 },
      { hour: '6 PM', messages: 15 }
    ],
    categoryBreakdown: [
      { category: 'Pricing', count: 45, percentage: 28 },
      { category: 'First Time', count: 38, percentage: 24 },
      { category: 'Aftercare', count: 32, percentage: 20 },
      { category: 'Services', count: 28, percentage: 18 },
      { category: 'Compliments', count: 16, percentage: 10 }
    ]
  }), []);

  const dateRangeToDays = useMemo(() => ({
    today: 1,
    week: 7,
    month: 30,
    quarter: 90
  }), []);

  const fetchChatData = useCallback(async () => {
    try {
      const selectedDays = dateRangeToDays[selectedDateRange] || 7;
      const response = await request(async () => {
        const [analyticsResponse, messagesResponse, qualityResponse] = await Promise.all([
          chatService.getAnalytics({ range: selectedDateRange }),
          chatService.getAllMessages({ page: 1, limit: 25 }),
          chatService.getQualitySummary({
            days: selectedDays,
            lowConfidenceThreshold: 0.62,
            topLimit: 10,
            sampleLimit: 12
          })
        ]);

        return {
          data: {
            analytics: analyticsResponse.data,
            messages: messagesResponse.data,
            quality: qualityResponse.data
          }
        };
      });

      if (!response?.success) {
        return;
      }

      const analyticsPayload = response?.data?.analytics?.data || {};
      const messagesPayload = response?.data?.messages?.data?.messages || [];
      const qualityPayload = response?.data?.quality?.data || {};

      const helpful = analyticsPayload?.helpfulnessStats?.helpful || 0;
      const notHelpful = analyticsPayload?.helpfulnessStats?.notHelpful || 0;
      const totalRatings = helpful + notHelpful;

      setAnalytics({
        totalMessages: analyticsPayload.totalMessages || 0,
        activeConversations: analyticsPayload?.sessionStats?.totalSessions || 0,
        avgResponseTime: null,
        positiveSentimentPct: totalRatings > 0 ? Number(((helpful / totalRatings) * 100).toFixed(1)) : 0,
        topQuestions: (analyticsPayload.keywordStats || []).slice(0, 5).map((item) => ({
          question: item._id,
          count: item.count
        })),
        hourlyDistribution: (analyticsPayload.dailyStats || []).slice(-10).map((item) => ({
          hour: item._id,
          messages: item.count
        })),
        categoryBreakdown: (analyticsPayload.messageTypes || []).map((item) => ({
          category: (item._id || 'unknown').replace(/_/g, ' '),
          count: item.count,
          percentage: analyticsPayload.totalMessages
            ? Number(((item.count / analyticsPayload.totalMessages) * 100).toFixed(1))
            : 0
        }))
      });

      setMessages(messagesPayload.map((item) => ({
        ...item,
        user: item.userId
          ? {
              _id: item.userId._id,
              name: item.userId.name || 'Registered User',
              email: item.userId.email || 'N/A'
            }
          : {
              _id: 'guest',
              name: 'Guest User',
              email: 'Anonymous'
            },
        category: item.messageType || 'general',
        sentiment: item.wasHelpful === true ? 'positive' : item.wasHelpful === false ? 'negative' : 'neutral',
        responseTime: null
      })));

      setQualitySummary({
        period: qualityPayload.period || { days: selectedDays },
        thresholds: qualityPayload.thresholds || { lowConfidence: 0.62 },
        totals: qualityPayload.totals || {
          totalMessages: 0,
          unknownQueries: 0,
          lowConfidenceQueries: 0,
          unresolvedQueries: 0,
          unknownRatePct: 0,
          lowConfidenceRatePct: 0,
          unresolvedRatePct: 0,
          avgConfidence: 0,
          ratedMessages: 0,
          notHelpfulRatings: 0
        },
        topUnresolvedQueries: qualityPayload.topUnresolvedQueries || [],
        recentUnresolvedSamples: qualityPayload.recentUnresolvedSamples || []
      });
    } catch (err) {
      console.log('Using mock data for chat analytics:', err);
      setMessages(mockMessages);
      setAnalytics(mockAnalytics);
      setQualitySummary({
        period: { days: 7 },
        thresholds: { lowConfidence: 0.62 },
        totals: {
          totalMessages: mockAnalytics.totalMessages,
          unknownQueries: 0,
          lowConfidenceQueries: 0,
          unresolvedQueries: 0,
          unknownRatePct: 0,
          lowConfidenceRatePct: 0,
          unresolvedRatePct: 0,
          avgConfidence: 0,
          ratedMessages: 0,
          notHelpfulRatings: 0
        },
        topUnresolvedQueries: [],
        recentUnresolvedSamples: []
      });
    }
  }, [request, selectedDateRange, dateRangeToDays, mockAnalytics, mockMessages]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatResponseTime = (seconds) => {
    if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
      return 'N/A';
    }

    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatCategory = (category) => {
    return (category || 'general').replace(/[_-]/g, ' ');
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const normalizedCategory = (category || 'general').replace(/\s+/g, '_').toLowerCase();
    const colors = {
      'first-time': 'bg-blue-100 text-blue-800',
      'pricing': 'bg-yellow-100 text-yellow-800',
      'services': 'bg-purple-100 text-purple-800',
      'aftercare': 'bg-green-100 text-green-800',
      'compliment': 'bg-pink-100 text-pink-800',
      'booking_faq': 'bg-blue-100 text-blue-800',
      'studio_info': 'bg-indigo-100 text-indigo-800',
      'greeting': 'bg-cyan-100 text-cyan-800',
      'general': 'bg-gray-100 text-gray-800',
      'unknown': 'bg-red-100 text-red-800'
    };
    return colors[normalizedCategory] || 'bg-gray-100 text-gray-800';
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Chat Analytics</h1>
          <p className={`mt-1 ${isDark ? 'text-gold-300' : 'text-gray-600'}`}>Monitor customer interactions and chatbot performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            options={dateRanges}
          />
          <Button
            variant="outline"
            onClick={fetchChatData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={clearError}>
          {typeof error === 'string' ? error : 'An error occurred while loading chat analytics'}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold-400">{analytics.totalMessages}</div>
                <div className="text-sm text-gold-300 mt-1">Total Messages</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold-400">{analytics.activeConversations}</div>
                <div className="text-sm text-gold-300 mt-1">Active Conversations</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold-400">{formatResponseTime(analytics.avgResponseTime)}</div>
                <div className="text-sm text-gold-300 mt-1">Avg Response Time</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold-400">
                  {analytics.positiveSentimentPct || 0}%
                </div>
                <div className="text-sm text-gold-300 mt-1">Positive Sentiment</div>
              </div>
            </Card>
          </div>

          <Card title={`Bot Quality Summary (Last ${qualitySummary.period?.days || 7} Days)`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-gold-400">Unknown Rate</p>
                <p className="text-2xl font-bold text-white mt-1">{qualitySummary.totals?.unknownRatePct || 0}%</p>
                <p className="text-xs text-gold-300 mt-1">{qualitySummary.totals?.unknownQueries || 0} queries</p>
              </div>
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-gold-400">Low Confidence Rate</p>
                <p className="text-2xl font-bold text-white mt-1">{qualitySummary.totals?.lowConfidenceRatePct || 0}%</p>
                <p className="text-xs text-gold-300 mt-1">{qualitySummary.totals?.lowConfidenceQueries || 0} queries</p>
              </div>
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-gold-400">Unresolved Rate</p>
                <p className="text-2xl font-bold text-white mt-1">{qualitySummary.totals?.unresolvedRatePct || 0}%</p>
                <p className="text-xs text-gold-300 mt-1">{qualitySummary.totals?.unresolvedQueries || 0} queries</p>
              </div>
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-gold-400">Avg Confidence</p>
                <p className="text-2xl font-bold text-white mt-1">{qualitySummary.totals?.avgConfidence || 0}</p>
                <p className="text-xs text-gold-300 mt-1">Threshold: {qualitySummary.thresholds?.lowConfidence || 0.62}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gold-300 mb-3">Top Unresolved Queries</h3>
                {qualitySummary.topUnresolvedQueries?.length > 0 ? (
                  <div className="space-y-2">
                    {qualitySummary.topUnresolvedQueries.map((item, index) => (
                      <div key={`${item.query}-${index}`} className="bg-dark-800 border border-dark-700 rounded-lg p-3">
                        <p className="text-sm text-white">{item.query}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-gold-300">
                          <span>Count: {item.count}</span>
                          <span>Avg conf: {item.avgConfidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gold-300">No unresolved query patterns in this period.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gold-300 mb-3">Recent Unresolved Samples</h3>
                {qualitySummary.recentUnresolvedSamples?.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {qualitySummary.recentUnresolvedSamples.map((item) => (
                      <div key={item._id} className="bg-dark-800 border border-dark-700 rounded-lg p-3">
                        <p className="text-xs text-gold-400">{formatDate(item.createdAt)}</p>
                        <p className="text-sm text-white mt-1">{item.message}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-gold-300">
                          <span className="capitalize">{formatCategory(item.messageType)}</span>
                          <span>Conf: {item.confidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gold-300">No recent unresolved samples for this period.</p>
                )}
              </div>
            </div>
          </Card>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Questions */}
            <Card title="Most Asked Questions" className="h-full">
              <div className="space-y-4">
                {(analytics.topQuestions || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{item.question}</div>
                      <div className="w-full bg-dark-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-gold-500 h-2 rounded-full"
                          style={{ width: `${(item.count / (analytics.topQuestions?.[0]?.count || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-sm font-medium text-gold-300">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Category Breakdown */}
            <Card title="Message Categories" className="h-full">
              <div className="space-y-3">
                {(analytics.categoryBreakdown || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: `hsl(${index * 72}, 70%, 60%)` }}></div>
                      <span className="text-sm font-medium text-white">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{item.count}</div>
                      <div className="text-xs text-gold-300">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Hourly Activity */}
          <Card title="Message Activity by Hour">
            <div className="flex items-end justify-between space-x-2 h-48">
              {(analytics.hourlyDistribution || []).map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-gold-500 rounded-t w-full transition-all hover:bg-gold-600"
                    style={{
                      height: `${(item.messages / Math.max(...(analytics.hourlyDistribution || []).map(h => h.messages), 1)) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <div className="text-xs text-gold-300 mt-2 transform -rotate-45 origin-top whitespace-nowrap">
                    {item.hour}
                  </div>
                  <div className="text-xs text-gold-300 mt-1">{item.messages}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Messages */}
          <Card title="Recent Messages">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.slice(0, 10).map((message) => (
                  <div
                    key={message._id}
                    className="border border-dark-700 rounded-lg p-4 hover:bg-dark-800 cursor-pointer transition-colors"
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium text-white">{message.user?.name}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getCategoryColor(message.category)}`}>
                          {formatCategory(message.category)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getSentimentColor(message.sentiment)}`}>
                          {message.sentiment}
                        </span>
                      </div>
                      <div className="text-sm text-gold-300">
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gold-400">Customer:</span>
                        <p className="text-sm text-gold-300 mt-1">{message.message}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-gold-400">Bot Response:</span>
                        <p className="text-sm text-gold-300 mt-1">{message.response}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 text-xs text-gold-300">
                      <span>Response Time: {formatResponseTime(message.responseTime)}</span>
                      <span>{message.user?.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.846 0-3.543-.51-4.986-1.39L3 21l1.896-3.486C3.51 16.057 3 14.318 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">No messages found</h3>
                <p className="mt-1 text-sm text-gold-300">No chat messages for the selected time period.</p>
              </div>
            )}
          </Card>

          {/* Message Details Modal */}
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Message Details"
            size="large"
          >
            {selectedMessage && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-dark-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gold-400">Name</p>
                      <p className="text-sm text-white">{selectedMessage.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gold-400">Email</p>
                      <p className="text-sm text-white">{selectedMessage.user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Conversation */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Conversation</h3>
                  <div className="space-y-4">
                    <div className="bg-dark-800 border border-neon-400/30 rounded-lg p-4">
                      <p className="text-sm font-medium text-neon-300 mb-2">Customer Message</p>
                      <p className="text-sm text-white">{selectedMessage.message}</p>
                    </div>
                    
                    <div className="bg-dark-800 border border-gold-500/30 rounded-lg p-4">
                      <p className="text-sm font-medium text-gold-300 mb-2">Bot Response</p>
                      <p className="text-sm text-white">{selectedMessage.response}</p>
                    </div>
                  </div>
                </div>

                {/* Message Analytics */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Message Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                      <p className="text-sm font-medium text-gold-400 mb-1">Category</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(selectedMessage.category)}`}>
                        {formatCategory(selectedMessage.category)}
                      </span>
                    </div>
                    
                    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                      <p className="text-sm font-medium text-gold-400 mb-1">Sentiment</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getSentimentColor(selectedMessage.sentiment)}`}>
                        {selectedMessage.sentiment}
                      </span>
                    </div>
                    
                    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                      <p className="text-sm font-medium text-gold-400 mb-1">Response Time</p>
                      <p className="text-sm text-white">{formatResponseTime(selectedMessage.responseTime)}</p>
                    </div>
                    
                    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                      <p className="text-sm font-medium text-gold-400 mb-1">Timestamp</p>
                      <p className="text-sm text-white">{formatDate(selectedMessage.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default ChatAnalytics;
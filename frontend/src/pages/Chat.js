import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { chatService } from '../services/api';
import Button from '../components/UI/Button';
import Alert from '../components/UI/Alert';

const CHAT_SESSION_STORAGE_KEY = 'inkcraft_chat_session_id';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { error, request, clearError } = useApi();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const persistSessionId = (value) => {
    if (!value) {
      return;
    }

    setSessionId(value);

    try {
      window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, value);
    } catch (storageError) {
      console.log('Unable to persist chat session ID:', storageError);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distanceFromBottom < 120); // threshold (px)
  };

  const loadChatHistory = useCallback(async (activeSessionId) => {
    if (!activeSessionId) {
      return;
    }
    
    try {
      const response = await request(() => chatService.getHistory(activeSessionId));

      if (!response?.success) {
        return;
      }

      const history = response?.data?.data?.messages || [];
      if (history.length > 0) {
        const chatHistoryMessages = history.flatMap((item) => {
          const visitorSender = isAuthenticated ? 'user' : 'visitor';
          return [
            {
              _id: `${item._id}-user`,
              message: item.message,
              sender: visitorSender,
              timestamp: item.createdAt
            },
            {
              _id: `${item._id}-bot`,
              message: item.response,
              sender: 'bot',
              timestamp: item.createdAt
            }
          ];
        });

        setMessages(chatHistoryMessages);
      }
    } catch (err) {
      console.log('No chat history found or error loading:', err);
    }
  }, [isAuthenticated, request]);

  // Restore existing session and load history on component mount
  useEffect(() => {
    try {
      const savedSessionId = window.localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
      if (savedSessionId) {
        setSessionId(savedSessionId);
        loadChatHistory(savedSessionId);
      }
    } catch (storageError) {
      console.log('Unable to restore chat session ID:', storageError);
    }
  }, [loadChatHistory]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        _id: 'welcome',
        message: `Hello${user ? ` ${user.name}` : ''}! 👋 Welcome to InkCraft. I'm here to help you with any questions about tattoos, our services, booking, or design ideas. How can I assist you today?`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isTyping) {
      return;
    }

    const trimmedMessage = newMessage.trim();
    
    const userMessage = {
      _id: Date.now().toString(),
      message: trimmedMessage,
      sender: isAuthenticated ? 'user' : 'visitor',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsAtBottom(true);
    setNewMessage('');
    setIsTyping(true);

    try {
      const response = await request(() => chatService.sendMessage({
        message: userMessage.message,
        sessionId: sessionId || undefined
      }));

      if (!response?.success) {
        throw new Error(response?.error?.message || 'Failed to send chat message');
      }

      const payload = response?.data?.data;
      if (!payload?.response) {
        throw new Error('Invalid chat response payload');
      }

      if (payload.sessionId && payload.sessionId !== sessionId) {
        persistSessionId(payload.sessionId);
      }

      const botMessage = {
        _id: payload.messageId ? `${payload.messageId}-bot` : (Date.now() + 1).toString(),
        message: payload.response,
        sender: 'bot',
        timestamp: payload.timestamp || new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (sendError) {
      console.error('Chat send failed:', sendError);

      const fallbackMessage = {
        _id: `${Date.now()}-fallback`,
        message: 'Sorry, I had trouble responding just now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const quickQuestions = [
    'What are your pricing ranges?',
    'How do I book an appointment?',
    'What styles do you specialize in?',
    'How much does a small tattoo cost?',
    'What should I expect for my first tattoo?',
    'Do you do cover-up tattoos?'
  ];

  const handleQuickQuestion = (question) => {
    setNewMessage(question);
    textareaRef.current?.focus();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
      {/* Header */}
      <section className={`${isDark ? 'gradient-bg-hero' : 'bg-gradient-to-r from-purple-600 to-blue-600'} text-white py-12`}>
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Chat Support</h1>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-purple-100'}`}>
              Get instant answers to your tattoo questions. Our AI assistant is here to help 24/7.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Quick Questions Sidebar */}
            <div className="lg:col-span-1">
              <div className={`card sticky top-24 ${isDark ? 'bg-dark-900 border-dark-700' : ''}`}>
                <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-secondary-900'} mb-4 font-display`}>Quick Questions</h3>
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className={`w-full text-left p-3 text-sm rounded-lg transition-colors duration-200 ${
                        isDark 
                          ? 'bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-gold-500' 
                          : 'bg-secondary-50 hover:bg-primary-50 hover:text-primary-700'
                      }`}
                    >
                      {question}
                    </button>
                  ))}
                </div>
                
                <div className={`mt-6 pt-6 border-t ${isDark ? 'border-dark-700' : 'border-secondary-200'}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-secondary-500'} mb-3`}>
                    Need human support?
                  </p>
                  <Button
                    variant={isDark ? 'outline' : 'outline'}
                    size="small"
                    fullWidth
                    onClick={() => window.open('/book', '_blank')}
                  >
                    Book Consultation
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <div className={`card h-[600px] flex flex-col ${isDark ? 'bg-dark-900 border-dark-700' : ''}`}>
                {/* Chat Header */}
                <div className={`flex items-center space-x-3 p-4 border-b ${isDark ? 'border-dark-700' : 'border-secondary-200'}`}>
                  <div className={`w-10 h-10 bg-gradient-to-br ${isDark ? 'from-gold-500 to-gold-600' : 'from-purple-500 to-primary-500'} rounded-full flex items-center justify-center ${isDark ? 'shadow-glow-gold' : ''}`}>
                    <span className={`${isDark ? 'text-dark-950' : 'text-white'} font-bold`}>AI</span>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-secondary-900'}`}>InkCraft Assistant</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>
                      {isAuthenticated ? `Chatting as ${user?.name}` : 'Chatting as Guest'}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>Online</span>
                  </div>
                </div>
                
                {/* Error Display */}
                {error && (
                  <Alert type="error" onClose={clearError} className="m-4">
                    {error}
                  </Alert>
                )}
                
                {/* Messages Area */}
                <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender === 'user' || message.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${
                        message.sender === 'user' || message.sender === 'visitor'
                          ? isDark ? 'bg-gold-600 text-dark-950' : 'bg-primary-600 text-white'
                          : isDark ? 'bg-dark-800 text-gray-200' : 'bg-secondary-100 text-secondary-900'
                      } rounded-2xl px-4 py-2`}>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' || message.sender === 'visitor'
                            ? isDark ? 'text-dark-900/70' : 'text-primary-100'
                            : isDark ? 'text-gray-400' : 'text-secondary-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className={`${isDark ? 'bg-dark-800' : 'bg-secondary-100'} rounded-2xl px-4 py-2`}>
                        <div className="flex space-x-1">
                          <div className={`w-2 h-2 ${isDark ? 'bg-gold-500' : 'bg-secondary-400'} rounded-full animate-bounce`}></div>
                          <div className={`w-2 h-2 ${isDark ? 'bg-gold-500' : 'bg-secondary-400'} rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
                          <div className={`w-2 h-2 ${isDark ? 'bg-gold-500' : 'bg-secondary-400'} rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input */}
                <div className={`p-4 border-t ${isDark ? 'border-dark-700' : 'border-secondary-200'}`}>
                  <div className="flex space-x-3">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className={`flex-1 resize-none border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent ${
                        isDark 
                          ? 'bg-dark-800 border-dark-700 text-gray-200 placeholder-gray-500 focus:ring-gold-500' 
                          : 'bg-white border-secondary-300 focus:ring-primary-500'
                      }`}
                      rows={1}
                      style={{
                        minHeight: '40px',
                        maxHeight: '120px',
                        height: 'auto'
                      }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isTyping}
                      variant="primary"
                      className="self-end"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                  
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-secondary-500'} mt-2`}>
                    Press Enter to send, Shift+Enter for new line
                    {!isAuthenticated && ' • Chat as guest or login to save history'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chat;
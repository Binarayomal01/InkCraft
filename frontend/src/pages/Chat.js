import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { chatService } from '../services/api';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Alert from '../components/UI/Alert';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { loading, error, request, clearError } = useApi();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

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
  }, [user]);

  const loadChatHistory = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await request(() => chatService.getHistory());
      if (response?.data?.length > 0) {
        setMessages(response.data.reverse()); // Reverse to show oldest first
        setChatStarted(true);
      }
    } catch (err) {
      console.log('No chat history found or error loading:', err);
    }
  };

  // Mock bot response generator
  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // FAQ responses
    if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
      return 'Tattoo pricing varies based on size, complexity, and style. Small tattoos start around $100-300, medium pieces $300-600, and larger work $600+. We provide detailed quotes during consultations. Would you like to book a free consultation?';
    }
    
    if (message.includes('pain') || message.includes('hurt') || message.includes('painful')) {
      return 'Pain levels vary by placement and individual tolerance. Areas with more muscle and fat (like arms, calves) tend to be less painful, while bony areas (ribs, ankles) can be more sensitive. We take breaks as needed and can discuss pain management techniques during your appointment.';
    }
    
    if (message.includes('book') || message.includes('appointment') || message.includes('schedule')) {
      return 'I\'d be happy to help you book an appointment! You can book online through our booking page, call us directly, or I can guide you through the process. What type of tattoo are you interested in?';
    }
    
    if (message.includes('aftercare') || message.includes('healing') || message.includes('care')) {
      return 'Proper aftercare is crucial! Keep it clean and moisturized, avoid soaking (showers are fine), no direct sunlight, and don\'t pick at scabs. We provide detailed aftercare instructions and recommend specific products. Healing typically takes 2-4 weeks for the surface.';
    }
    
    if (message.includes('style') || message.includes('design') || message.includes('idea')) {
      return 'We specialize in many styles including traditional, realism, tribal, geometric, watercolor, and more! Our AI design generator can help you visualize ideas, or browse our gallery for inspiration. What style interests you most?';
    }
    
    if (message.includes('first tattoo') || message.includes('virgin skin') || message.includes('nervous')) {
      return 'First tattoo? That\'s exciting! We\'re very experienced with first-timers. Start with something small to medium, choose a less sensitive area, and don\'t worry - we\'ll guide you through everything. Many clients find it much easier than expected!';
    }
    
    if (message.includes('age') || message.includes('minor') || message.includes('years old')) {
      return 'You must be 18+ to get tattooed, with valid ID required. We don\'t make exceptions for minors, even with parental consent, as per our studio policy and local regulations.';
    }
    
    if (message.includes('color') || message.includes('black and grey') || message.includes('colours')) {
      return 'We work with both color and black & grey tattoos! Color tattoos are vibrant and eye-catching but may require more sessions and touch-ups over time. Black and grey offers timeless elegance and often ages better. What style appeals to you?';
    }
    
    if (message.includes('cover up') || message.includes('cover-up') || message.includes('old tattoo')) {
      return 'We specialize in cover-up work! Successful cover-ups depend on the size, color, and age of the existing tattoo. Darker, larger designs work best for covering. We can often incorporate existing work into new designs. Book a consultation to discuss options!';
    }
    
    if (message.includes('touch up') || message.includes('touch-up') || message.includes('free touch up')) {
      return 'We offer free touch-ups within the first 6 months if needed, which is rare with proper aftercare. After that, touch-ups are available at a reduced rate. Most of our work heals beautifully without needing touch-ups!';
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return 'Hello! Great to chat with you. I\'m here to answer any questions about tattoos, our services, or help you get started on your ink journey. What would you like to know?';
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return 'You\'re very welcome! Feel free to ask if you have any other questions. We\'re here to help make your tattoo experience amazing!';
    }
    
    if (message.includes('location') || message.includes('address') || message.includes('where')) {
      return 'We\'re located in the heart of the city! You can find our exact address and directions on our contact page. We\'re easily accessible by public transport and have parking nearby.';
    }
    
    if (message.includes('hours') || message.includes('open') || message.includes('closed')) {
      return 'We\'re open Monday-Friday 9AM-5PM, and Saturday 10AM-6PM. We\'re closed Sundays to give our artists time to recharge. You can book appointments online 24/7 though!';
    }
    
    // Default responses
    const defaultResponses = [
      'That\'s a great question! While I can help with basic information, I\'d recommend speaking with one of our artists for detailed advice. Would you like to book a consultation?',
      'I\'d love to help you with that! For the best answer, you might want to discuss this during a consultation with our artists. They can provide personalized advice for your specific needs.',
      'Thanks for asking! Our experienced artists would be the best people to give you detailed information about that. You can book a free consultation to discuss your ideas in detail.',
      'That\'s an interesting question! Every situation is unique, so I\'d suggest booking a consultation where our artists can give you personalized advice and show you examples of their work.'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage = {
      _id: Date.now().toString(),
      message: newMessage.trim(),
      sender: isAuthenticated ? 'user' : 'visitor',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);
    setChatStarted(true);
    
    // Save message if user is authenticated
    if (isAuthenticated) {
      try {
        await request(() => chatService.sendMessage({
          message: userMessage.message,
          sender: 'user'
        }));
      } catch (err) {
        console.log('Failed to save user message:', err);
      }
    }
    
    // Simulate bot typing delay
    setTimeout(async () => {
      const botResponseText = generateBotResponse(userMessage.message);
      const botMessage = {
        _id: (Date.now() + 1).toString(),
        message: botResponseText,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Save bot message if user is authenticated
      if (isAuthenticated) {
        try {
          await request(() => chatService.sendMessage({
            message: botMessage.message,
            sender: 'bot'
          }));
        } catch (err) {
          console.log('Failed to save bot message:', err);
        }
      }
    }, 1000 + Math.random() * 2000); // 1-3 second delay
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
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
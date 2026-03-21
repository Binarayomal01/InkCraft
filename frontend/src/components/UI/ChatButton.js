import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const ChatButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  
  // Don't show the chat button if we're already on the chat page
  if (location.pathname === '/chat') {
    return null;
  }

  const handleClick = () => {
    navigate('/chat');
  };

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-16 h-16 rounded-full
        flex items-center justify-center
        shadow-2xl
        transform transition-all duration-300
        hover:scale-110 hover:shadow-glow-gold
        ${isDark 
          ? 'bg-gradient-to-br from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700' 
          : 'bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
        }
        group
      `}
      aria-label="Open chat"
      title="Chat with us"
    >
      {/* Chat Icon */}
      <svg 
        className="w-8 h-8 text-white group-hover:scale-110 transition-transform" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
        />
      </svg>

      {/* Notification Badge (optional - can be activated later) */}
      {/* <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
        3
      </span> */}
    </button>
  );
};

export default ChatButton;

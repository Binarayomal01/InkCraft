import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Always dark mode for tattoo studio aesthetic
  const isDark = true;
  
  // Motion preferences - respect system settings
  const [reduceMotion, setReduceMotion] = useState(false);

  // Apply dark theme to body on mount
  useEffect(() => {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  }, []);

  // Check for user's motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    
    const handleChange = (e) => {
      setReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleMotion = () => {
    setReduceMotion(!reduceMotion);
  };

  const value = {
    isDark,
    reduceMotion,
    toggleMotion,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

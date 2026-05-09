import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Header from './Header';
import Footer from './Footer';
import ChatButton from '../UI/ChatButton';

const Layout = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <Header />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
      
      {/* Floating Chat Button */}
      <ChatButton />
    </div>
  );
};

export default Layout;
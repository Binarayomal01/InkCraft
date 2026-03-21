import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../UI/Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/ai-design', label: 'AI Design' },
    { to: '/chat', label: 'Chat' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <header className={`${isDark ? 'bg-dark-900/95 border-gold-500/20' : 'bg-white/95 border-gray-200'} backdrop-blur-lg shadow-xl border-b sticky top-0 z-40`}>
      <nav className="container-max">
        <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-blood-600 rounded-lg flex items-center justify-center shadow-glow-gold group-hover:scale-110 transition-transform duration-300">
              <span className="text-dark-950 font-bold text-2xl font-accent">I</span>
            </div>
            <span className={`font-display text-3xl font-bold tracking-wider ${isDark ? 'text-gold-500' : 'text-gray-900'}`}>
              InkCraft
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-link text-base"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-dark-800 border border-gold-500/30">
                  <div className="w-9 h-9 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center shadow-glow-gold/50">
                    <span className="text-dark-950 font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-200 font-medium">
                    {user?.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="small">
                    Login
                  </Button>
                </Link>
                <Link to="/book">
                  <Button variant="primary" size="small">
                    Book Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-all duration-300 ${isDark ? 'hover:bg-dark-800 text-gray-300 hover:text-gold-500' : 'hover:bg-gray-100 text-gray-600 hover:text-gold-600'}`}
            onClick={toggleMobileMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t animate-slide-down ${isDark ? 'border-dark-700 bg-dark-900/98' : 'border-gray-200 bg-white/98'} backdrop-blur-lg`}>
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block nav-link py-3 px-4 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-800' : 'hover:bg-gray-100'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-dark-700">
                {/* User Menu */}
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <Link
                      to="/dashboard"
                      className="block nav-link py-3 px-4 rounded-lg hover:bg-dark-800 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <div className="flex items-center space-x-3 p-4 rounded-lg bg-dark-800 border border-gold-500/30">
                      <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center shadow-glow-gold/50">
                        <span className="text-dark-950 font-bold">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-200 font-medium">
                        {user?.name}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="small"
                      fullWidth
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" size="small" fullWidth>
                        Login
                      </Button>
                    </Link>
                    <Link to="/book" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="primary" size="small" fullWidth>
                        Book Now
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
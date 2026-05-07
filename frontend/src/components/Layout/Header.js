import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { bookingService } from '../../services/api';
import Button from '../UI/Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [bookingNotifications, setBookingNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const notificationPanelRef = useRef(null);

  const userIdentifier = user?.id || user?._id || user?.email || null;
  const isAdminUser = user?.role === 'admin';
  const notificationSeenKey = useMemo(() => {
    if (!userIdentifier) return null;
    return `inkcraft_booking_notifications_seen_${userIdentifier}`;
  }, [userIdentifier]);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Updated';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'approved':
        return 'Your booking has been accepted by the studio.';
      case 'rejected':
        return 'Your booking request was rejected. Check notes for details.';
      case 'completed':
        return 'Your tattoo session has been marked as completed.';
      case 'cancelled':
        return 'This booking was cancelled.';
      default:
        return 'Your booking received a status update.';
    }
  };

  const getStatusBadgeClass = (status) => {
    if (isDark) {
      if (status === 'approved') return 'bg-green-900/50 text-green-300 border border-green-700/60';
      if (status === 'rejected') return 'bg-red-900/50 text-red-300 border border-red-700/60';
      if (status === 'completed') return 'bg-blue-900/50 text-blue-300 border border-blue-700/60';
      return 'bg-gray-800 text-gray-300 border border-gray-600';
    }

    if (status === 'approved') return 'bg-green-100 text-green-700 border border-green-200';
    if (status === 'rejected') return 'bg-red-100 text-red-700 border border-red-200';
    if (status === 'completed') return 'bg-blue-100 text-blue-700 border border-blue-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const formatNotificationTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const markNotificationsAsRead = () => {
    if (!notificationSeenKey) return;
    localStorage.setItem(notificationSeenKey, String(Date.now()));
    setUnreadNotificationCount(0);
  };

  const handleNotificationToggle = () => {
    setIsNotificationOpen((previous) => {
      const willOpen = !previous;

      if (willOpen && unreadNotificationCount > 0) {
        markNotificationsAsRead();
      }

      return willOpen;
    });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const loadNotifications = async () => {
      if (!isAuthenticated || !userIdentifier || isAdminUser) {
        if (isMounted) {
          setBookingNotifications([]);
          setUnreadNotificationCount(0);
        }
        return;
      }

      try {
        const response = await bookingService.getUserBookings();
        const bookings = response?.data?.data?.bookings || [];
        const updates = bookings
          .filter((booking) => booking.status && booking.status !== 'pending')
          .map((booking) => ({
            id: booking._id,
            status: booking.status,
            title: booking.tattooStyle ? `${booking.tattooStyle} tattoo booking` : 'Booking update',
            message: getStatusMessage(booking.status),
            updatedAt: booking.updatedAt || booking.createdAt,
            bookingId: booking._id
          }))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 8);

        if (!isMounted) return;

        setBookingNotifications(updates);

        const lastSeenRaw = notificationSeenKey ? localStorage.getItem(notificationSeenKey) : null;
        const lastSeenAt = lastSeenRaw ? parseInt(lastSeenRaw, 10) : 0;

        const unreadCount = updates.reduce((count, notification) => {
          const updatedTime = new Date(notification.updatedAt).getTime();
          if (!Number.isNaN(updatedTime) && updatedTime > lastSeenAt) {
            return count + 1;
          }
          return count;
        }, 0);

        setUnreadNotificationCount(unreadCount);
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load booking notifications:', error);
          setBookingNotifications([]);
          setUnreadNotificationCount(0);
        }
      }
    };

    loadNotifications();

    if (isAuthenticated && userIdentifier && !isAdminUser) {
      intervalId = setInterval(loadNotifications, 60000);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, isAdminUser, notificationSeenKey, userIdentifier]);

  const handleLogout = () => {
    setIsNotificationOpen(false);
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

  const navLinkClass = ({ isActive }) => `nav-link text-base${isActive ? ' nav-link-active' : ''}`;
  const navLinkCompactClass = ({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`;
  const navLinkMobileClass = ({ isActive }) => (
    `block nav-link py-3 px-4 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-800' : 'hover:bg-gray-100'}` +
    (isActive ? ' nav-link-active' : '')
  );

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
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClass}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4 ml-6 lg:ml-10">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <NavLink to="/dashboard" className={navLinkCompactClass}>
                  Dashboard
                </NavLink>
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
                {!isAdminUser && (
                  <div className="relative" ref={notificationPanelRef}>
                    <button
                      type="button"
                      onClick={handleNotificationToggle}
                      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors duration-200 ${
                        isDark
                          ? 'border-gold-500/40 text-gold-400 hover:bg-dark-800 hover:border-gold-400'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-label="Open notifications"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                        </span>
                      )}
                    </button>

                    {isNotificationOpen && (
                      <div
                        className={`absolute right-0 top-full mt-3 w-80 rounded-xl border shadow-2xl overflow-hidden z-50 ${
                          isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className={`px-4 py-3 border-b flex items-center justify-between ${
                          isDark ? 'border-dark-700' : 'border-gray-200'
                        }`}>
                          <h4 className={`font-semibold text-sm ${isDark ? 'text-gold-300' : 'text-gray-800'}`}>
                            Booking Updates
                          </h4>
                          <Link
                            to="/dashboard"
                            className={`text-xs font-medium ${isDark ? 'text-gold-400 hover:text-gold-300' : 'text-blue-600 hover:text-blue-500'}`}
                            onClick={() => setIsNotificationOpen(false)}
                          >
                            View all
                          </Link>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                          {bookingNotifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                No booking updates yet.
                              </p>
                            </div>
                          ) : (
                            bookingNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`px-4 py-3 border-b last:border-b-0 ${
                                  isDark ? 'border-dark-700' : 'border-gray-100'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {notification.title}
                                    </p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {notification.message}
                                    </p>
                                  </div>
                                  <span className={`text-[10px] px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getStatusBadgeClass(notification.status)}`}>
                                    {getStatusLabel(notification.status)}
                                  </span>
                                </div>
                                <p className={`text-[11px] mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {formatNotificationTime(notification.updatedAt)}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={navLinkMobileClass}
                  end={link.to === '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              
              <div className="pt-4 border-t border-dark-700">
                {/* User Menu */}
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <NavLink
                      to="/dashboard"
                      className={navLinkMobileClass}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </NavLink>
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
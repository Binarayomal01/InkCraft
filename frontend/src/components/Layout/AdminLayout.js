import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { adminService, tattooDesignService } from '../../services/api';
import Button from '../UI/Button';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const notificationPanelRef = useRef(null);
  const notificationSeenKey = useMemo(() => 'inkcraft_admin_notifications_seen', []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const parseSeenCounts = () => {
    try {
      const raw = localStorage.getItem(notificationSeenKey);
      if (!raw) return { pendingBookings: 0, pendingGallery: 0 };
      const parsed = JSON.parse(raw);
      return {
        pendingBookings: Number(parsed.pendingBookings) || 0,
        pendingGallery: Number(parsed.pendingGallery) || 0
      };
    } catch (error) {
      return { pendingBookings: 0, pendingGallery: 0 };
    }
  };

  const markNotificationsAsRead = (counts) => {
    localStorage.setItem(notificationSeenKey, JSON.stringify(counts));
    setUnreadNotificationCount(0);
  };

  const handleNotificationToggle = () => {
    setIsNotificationOpen((previous) => {
      const willOpen = !previous;
      if (willOpen && notifications.length > 0) {
        const currentCounts = notifications.reduce((acc, item) => {
          if (item.id === 'pending-bookings') acc.pendingBookings = item.count;
          if (item.id === 'pending-gallery') acc.pendingGallery = item.count;
          return acc;
        }, { pendingBookings: 0, pendingGallery: 0 });
        markNotificationsAsRead(currentCounts);
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
      try {
        const [statsResponse, galleryResponse] = await Promise.all([
          adminService.getStats('week'),
          tattooDesignService.adminGetGallerySubmissions({ status: 'pending', limit: 1 })
        ]);

        const pendingBookings = Number(statsResponse?.data?.data?.pendingBookings) || 0;
        const pendingGallery = Number(galleryResponse?.data?.data?.pagination?.totalDesigns) || 0;

        const nextNotifications = [];
        if (pendingBookings > 0) {
          nextNotifications.push({
            id: 'pending-bookings',
            title: 'Pending bookings',
            message: `${pendingBookings} booking(s) awaiting review`,
            link: '/admin/bookings',
            count: pendingBookings
          });
        }
        if (pendingGallery > 0) {
          nextNotifications.push({
            id: 'pending-gallery',
            title: 'Gallery submissions',
            message: `${pendingGallery} AI design(s) awaiting approval`,
            link: '/admin/designs',
            count: pendingGallery
          });
        }

        if (!isMounted) return;

        setNotifications(nextNotifications);

        const seen = parseSeenCounts();
        const unreadCount = Math.max(0, pendingBookings - seen.pendingBookings)
          + Math.max(0, pendingGallery - seen.pendingGallery);

        setUnreadNotificationCount(unreadCount);
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load admin notifications:', error);
          setNotifications([]);
          setUnreadNotificationCount(0);
        }
      }
    };

    loadNotifications();
    intervalId = setInterval(loadNotifications, 60000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [notificationSeenKey]);

  const sidebarItems = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
        </svg>
      )
    },
    {
      to: '/admin/bookings',
      label: 'Bookings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      to: '/admin/users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a4 4 0 110 8 4 4 0 010-8zm0 10c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z" />
        </svg>
      )
    },
    {
      to: '/admin/designs',
      label: 'Designs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      to: '/admin/chat-analytics',
      label: 'Chat Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-dark-950' : 'bg-secondary-50'}`}>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} ${isDark ? 'bg-dark-900 border-r border-dark-700' : 'bg-white'} shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className={`p-6 border-b ${isDark ? 'border-dark-700' : 'border-secondary-200'}`}>
          <Link to="/admin/dashboard" className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-gradient-to-br from-gold-600 to-gold-700' : 'bg-gradient-to-br from-primary-600 to-accent-600'
            }`}>
              <span className="text-white font-bold text-xl">I</span>
            </div>
            {isSidebarOpen && (
              <div>
                <span className={`font-display text-xl font-bold ${
                  isDark ? 'text-gold-400' : 'text-secondary-900'
                }`}>
                  InkCraft
                </span>
                <div className={`text-xs font-medium ${
                  isDark ? 'text-gold-300' : 'text-secondary-500'
                }`}>
                  Admin Panel
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? isDark ? 'bg-gold-600 text-dark-950 shadow-md' : 'bg-primary-600 text-white shadow-md' 
                        : isDark ? 'text-gold-300 hover:bg-dark-800' : 'text-secondary-700 hover:bg-secondary-100'
                      }
                    `}
                  >
                    <span className={`${isActive ? isDark ? 'text-dark-950' : 'text-white' : isDark ? 'text-gold-400' : 'text-secondary-500'}`}>
                      {item.icon}
                    </span>
                    {isSidebarOpen && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              )}
            )}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className={`p-4 border-t ${isDark ? 'border-dark-700' : 'border-secondary-200'}`}>
          <div className={`flex items-center space-x-3 mb-4 ${!isSidebarOpen ? 'justify-center' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gold-600' : 'bg-primary-100'}`}>
              <span className={`font-semibold text-sm ${isDark ? 'text-dark-950' : 'text-primary-600'}`}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            {isSidebarOpen && (
              <div className="flex-1">
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-secondary-900'}`}>
                  {user?.name}
                </div>
                <div className={`text-xs ${isDark ? 'text-gold-300' : 'text-secondary-500'}`}>Administrator</div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="small"
              fullWidth={isSidebarOpen}
              onClick={handleLogout}
              className={!isSidebarOpen ? 'px-3' : ''}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isSidebarOpen && 'Logout'}
            </Button>
            
            <Link to="/" target="_blank">
              <Button
                variant="outline"
                size="small"
                fullWidth={isSidebarOpen}
                className={!isSidebarOpen ? 'px-3' : ''}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {isSidebarOpen && 'View Site'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`shadow-sm border-b px-6 py-4 ${
          isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-secondary-200'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-dark-800' : 'hover:bg-secondary-100'
              }`}
            >
              <svg className={`w-6 h-6 ${
                isDark ? 'text-gold-400' : 'text-secondary-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="relative flex items-center space-x-4" ref={notificationPanelRef}>
              <button
                type="button"
                onClick={handleNotificationToggle}
                className={`relative rounded-lg p-2 transition-colors ${
                  isDark ? 'hover:bg-dark-800 text-gold-400' : 'hover:bg-secondary-100 text-secondary-600'
                }`}
                aria-label="Admin notifications"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className={`absolute right-0 top-12 w-72 rounded-lg border shadow-xl ${
                  isDark ? 'border-dark-700 bg-dark-900' : 'border-gray-200 bg-white'
                }`}>
                  <div className={`px-4 py-3 text-sm font-semibold ${
                    isDark ? 'text-gold-300' : 'text-gray-700'
                  }`}>
                    Admin notifications
                  </div>
                  <div className={`border-t ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                    {notifications.length === 0 ? (
                      <div className={`px-4 py-4 text-sm ${isDark ? 'text-gold-300' : 'text-gray-600'}`}>
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setIsNotificationOpen(false);
                            navigate(item.link);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                            isDark ? 'text-gold-200 hover:bg-dark-800' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">{item.title}</div>
                          <div className={`text-xs ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                            {item.message}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className={`text-sm ${
                isDark ? 'text-gold-300' : 'text-secondary-600'
              }`}>
                Welcome back, <span className="font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto p-6 ${
          isDark ? 'bg-dark-950' : 'bg-secondary-50'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
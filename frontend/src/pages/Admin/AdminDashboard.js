import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Alert from '../../components/UI/Alert';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalDesigns: 0,
    recentBookings: [],
    recentUsers: []
  });
  const [timeFilter, setTimeFilter] = useState('week');
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { loading, error, request, clearError } = useApi();

  // Mock data for demonstration
  const mockStats = {
    totalUsers: 47,
    totalBookings: 123,
    pendingBookings: 8,
    totalDesigns: 89,
    totalRevenue: 15420,
    recentBookings: [
      {
        _id: '1',
        customerName: 'John Smith',
        tattooStyle: 'Traditional',
        preferredDate: '2026-02-15',
        status: 'pending',
        createdAt: '2026-02-10T10:30:00Z'
      },
      {
        _id: '2',
        customerName: 'Sarah Johnson',
        tattooStyle: 'Watercolor',
        preferredDate: '2026-02-18',
        status: 'confirmed',
        createdAt: '2026-02-09T14:20:00Z'
      },
      {
        _id: '3',
        customerName: 'Mike Wilson',
        tattooStyle: 'Geometric',
        preferredDate: '2026-02-20',
        status: 'pending',
        createdAt: '2026-02-08T16:45:00Z'
      }
    ],
    recentUsers: [
      {
        _id: '1',
        name: 'Emma Davis',
        email: 'emma@email.com',
        createdAt: '2026-02-10T09:15:00Z'
      },
      {
        _id: '2',
        name: 'Alex Thompson',
        email: 'alex@email.com',
        createdAt: '2026-02-09T11:30:00Z'
      }
    ]
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await request(() => adminService.getStats(timeFilter));
      console.log('API Response:', response);
      // Backend returns {success: true, data: {...stats...}}
      // useApi wraps it again, so we need response.data.data
      if (response?.data?.data) {
        setStats(response.data.data);
      } else if (response?.data) {
        // Fallback in case structure is different
        setStats(response.data);
      } else {
        console.warn('No data in response, using mock data');
        setStats(mockStats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      console.log('Using mock data for admin dashboard');
      setStats(mockStats);
    }
  };

  useEffect(() => {
    // Fetch real stats on mount (don't set mock data immediately)
    fetchStats();
  }, [timeFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {user?.name}!
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gold-300' : 'text-gray-600'}`}>
            Here's what's happening at InkCraft today.
          </p>
        </div>
        <div className="flex space-x-2">
          {['week', 'month', 'quarter'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-all ${
                timeFilter === filter
                  ? isDark ? 'bg-gold-600 text-dark-950' : 'bg-primary-600 text-white'
                  : isDark ? 'bg-dark-800 text-white hover:bg-dark-700 border border-dark-700' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              This {filter}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={clearError}>
          {typeof error === 'string' ? error : 'An error occurred while loading admin data'}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    isDark ? 'bg-blue-500/20' : 'bg-blue-500'
                  }`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-600'}`}>Total Users</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-gold-400' : 'text-gray-900'}`}>{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    isDark ? 'bg-green-500/20' : 'bg-green-500'
                  }`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-600'}`}>Total Bookings</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-gold-400' : 'text-gray-900'}`}>{stats.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    isDark ? 'bg-yellow-500/20' : 'bg-yellow-500'
                  }`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-600'}`}>Pending Bookings</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-gold-400' : 'text-gray-900'}`}>{stats.pendingBookings}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    isDark ? 'bg-purple-500/20' : 'bg-purple-500'
                  }`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-600'}`}>Total Designs</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-gold-400' : 'text-gray-900'}`}>{stats.totalDesigns}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <div className={`rounded-lg shadow ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b flex justify-between items-center ${
                isDark ? 'border-dark-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-lg font-display font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Bookings</h2>
                <Link to="/admin/bookings" className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-gold-500 hover:text-gold-400' : 'text-primary-600 hover:text-primary-700'
                }`}>
                  View all
                </Link>
              </div>
              <div className={`divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-200'}`}>
                {stats.recentBookings?.map((booking) => (
                  <div key={booking._id} className={`px-6 py-4 transition-colors ${
                    isDark ? 'hover:bg-dark-800' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {booking.userId?.name || booking.customerName || 'Unknown'}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                          {booking.tattooStyle} tattoo • {formatDate(booking.preferredDate)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(booking.status)
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className={`px-6 py-8 text-center ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                    No recent bookings
                  </div>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className={`rounded-lg shadow ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b flex justify-between items-center ${
                isDark ? 'border-dark-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-lg font-display font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Users</h2>
                <Link to="/admin/users" className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-gold-500 hover:text-gold-400' : 'text-primary-600 hover:text-primary-700'
                }`}>
                  View all
                </Link>
              </div>
              <div className={`divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-200'}`}>
                {stats.recentUsers?.map((user) => (
                  <div key={user._id} className={`px-6 py-4 transition-colors ${
                    isDark ? 'hover:bg-dark-800' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          isDark ? 'bg-dark-800' : 'bg-gray-200'
                        }`}>
                          <span className={`text-sm font-medium ${isDark ? 'text-gold-300' : 'text-gray-600'}`}>
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                        <p className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>{user.email}</p>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                        {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className={`px-6 py-8 text-center ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                    No new users
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`rounded-lg shadow ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-display font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              <Link to="/admin/bookings" className={`flex items-center p-4 border-2 rounded-lg transition-all duration-300 ${
                isDark 
                  ? 'border-dark-700 hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/20 bg-dark-800' 
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-gold-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage Bookings</p>
                  <p className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>View and update appointments</p>
                </div>
              </Link>

              <Link to="/admin/designs" className={`flex items-center p-4 border-2 rounded-lg transition-all duration-300 ${
                isDark 
                  ? 'border-dark-700 hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/20 bg-dark-800' 
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-gold-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage Designs</p>
                  <p className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>Upload and organize portfolios</p>
                </div>
              </Link>

              <Link to="/admin/chat-analytics" className={`flex items-center p-4 border-2 rounded-lg transition-all duration-300 ${
                isDark 
                  ? 'border-dark-700 hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/20 bg-dark-800' 
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-gold-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Chat Analytics</p>
                  <p className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>Monitor customer conversations</p>
                </div>
              </Link>

              <Link to="/admin/user-analytics" className={`flex items-center p-4 border-2 rounded-lg transition-all duration-300 ${
                isDark 
                  ? 'border-dark-700 hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/20 bg-dark-800' 
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-gold-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3v18m8-9H3m14-7H7a4 4 0 00-4 4v10a2 2 0 002 2h10a4 4 0 004-4V7a2 2 0 00-2-2z" />
                </svg>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>User Analytics</p>
                  <p className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>Track growth and activity</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
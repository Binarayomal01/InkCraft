import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { bookingService, tattooDesignService, reviewService } from '../services/api';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Alert from '../components/UI/Alert';
import Modal from '../components/UI/Modal';
import ReviewModal from '../components/UI/ReviewModal';
import StarRating from '../components/UI/StarRating';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    savedDesigns: 0
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const clearError = () => {
    setError(null);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/dashboard' } } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch bookings
      const bookingsResponse = await bookingService.getUserBookings();
      console.log('Bookings Response:', bookingsResponse);
      const bookingsData = bookingsResponse?.data?.data?.bookings || [];
      console.log('Bookings Data:', bookingsData);
      setBookings(bookingsData);
      
      // Fetch saved designs
      let designsData = [];
      try {
        const designsResponse = await tattooDesignService.getUserDesigns();
        designsData = designsResponse?.data?.data || designsResponse?.data || [];
        setSavedDesigns(designsData);
      } catch (designError) {
        console.log('No saved designs or error fetching:', designError);
        setSavedDesigns([]);
      }
      
      // Calculate stats
      const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
      const approvedBookings = bookingsData.filter(b => b.status === 'approved').length;
      const completedBookings = bookingsData.filter(b => b.status === 'completed').length;
      
      setStats({
        totalBookings: bookingsData.length,
        pendingBookings: pendingBookings + approvedBookings,
        completedBookings: completedBookings,
        savedDesigns: designsData.length
      });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Failed to load dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAuthenticated]);

  // Fetch reviews for completed bookings
  const fetchReviews = async (bookingIds) => {
    try {
      const reviewPromises = bookingIds.map(bookingId => 
        reviewService.getByBooking(bookingId).catch(() => null)
      );
      const reviewResponses = await Promise.all(reviewPromises);
      
      const reviewsMap = {};
      reviewResponses.forEach((response, index) => {
        if (response?.data?.data?.review) {
          reviewsMap[bookingIds[index]] = response.data.data.review;
        }
      });
      setReviews(reviewsMap);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Fetch reviews when bookings are loaded
  useEffect(() => {
    if (bookings.length > 0) {
      const completedBookingIds = bookings
        .filter(b => b.status === 'completed')
        .map(b => b._id);
      if (completedBookingIds.length > 0) {
        fetchReviews(completedBookingIds);
      }
    }
  }, [bookings]);

  const handleReviewClick = (booking) => {
    setSelectedBookingForReview(booking);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await reviewService.create({
        bookingId: selectedBookingForReview._id,
        ...reviewData
      });
      
      // Refresh reviews
      await fetchReviews([selectedBookingForReview._id]);
      
      setShowReviewModal(false);
      setSelectedBookingForReview(null);
      
      setError('Review submitted successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setSelectedBookingForReview(null);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'approved':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    // preferredTime is already formatted as "9:00 AM - 12:00 PM"
    // So just return it directly
    return timeString;
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleModalClose = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await bookingService.delete(bookingId);
      // Refresh the bookings list
      await fetchDashboardData();
      handleModalClose();
      setError('Booking cancelled successfully');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
    }
  };

  const handleDesignClick = (design) => {
    setSelectedDesign(design);
    setShowDesignModal(true);
  };

  const handleDesignModalClose = () => {
    setShowDesignModal(false);
    setSelectedDesign(null);
  };

  const handleDeleteDesign = async (designId) => {
    if (!window.confirm('Are you sure you want to delete this design?')) return;
    
    try {
      await tattooDesignService.delete(designId);
      // Refresh the designs list
      await fetchDashboardData();
      handleDesignModalClose();
    } catch (err) {
      console.error('Error deleting design:', err);
      alert('Failed to delete design. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'My Bookings' },
    { id: 'designs', label: 'Saved Designs' }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-secondary-50'}`}>
      {/* Header */}
      <section className={`${isDark ? 'gradient-bg-hero border-dark-700' : 'bg-white border-b'}`}>
        <div className="container-max py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'} mb-2`}>
                Welcome back, {user?.name}!
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-secondary-600'}>
                Manage your bookings, view saved designs, and track your tattoo journey.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link to="/book">
                <Button variant="primary">
                  Book New Appointment
                </Button>
              </Link>
              <Link to="/ai-design">
                <Button variant="outline">
                  Generate Design
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className={`${isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-b'} sticky top-20 z-10`}>
        <div className="container-max">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? isDark ? 'border-gold-500 text-gold-500' : 'border-primary-500 text-primary-600'
                    : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-dark-700' : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="section-padding">
        <div className="container-max">
          {error && (
            <Alert type="error" onClose={clearError} className="mb-8">
              {typeof error === 'string' ? error : 'An error occurred while loading dashboard data'}
            </Alert>
          )}

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`card ${isDark ? 'bg-dark-900 border-dark-700' : ''}`}>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>Total Bookings</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'}`}>{stats.totalBookings}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`card ${isDark ? 'bg-dark-900 border-dark-700' : ''}`}>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
                    }`}>
                      <svg className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>Pending</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'}`}>{stats.pendingBookings}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`card ${isDark ? 'bg-dark-900 border-dark-700' : ''}`}>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-green-500/20' : 'bg-green-100'
                    }`}>
                      <svg className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>Completed</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'}`}>{stats.completedBookings}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`card ${isDark ? 'bg-dark-900 border-dark-700' : ''}`}>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                    }`}>
                      <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>Saved Designs</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'}`}>{stats.savedDesigns}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <div className={`card ${isDark ? 'bg-dark-900 border-dark-700' : ''}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-display font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'}`}>Recent Bookings</h2>
                    <Button variant="ghost" size="small" onClick={() => setSelectedTab('bookings')}>
                      View All
                    </Button>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking._id}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            isDark ? 'bg-dark-800 hover:bg-dark-700' : 'bg-secondary-50 hover:bg-secondary-100'
                          }`}
                          onClick={() => handleBookingClick(booking)}
                        >
                          <div className="flex-1">
                            <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-secondary-900'} capitalize`}>
                              {booking.tattooStyle} Tattoo
                            </h4>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>
                              {formatDate(booking.preferredDate)} at {formatTime(booking.preferredTime)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(booking.status)
                          }`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-secondary-400'} mx-auto mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className={`${isDark ? 'text-gray-400' : 'text-secondary-600'} mb-4`}>No bookings yet</p>
                      <Link to="/book">
                        <Button variant="primary" size="small">
                          Book Your First Appointment
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className={`card ${isDark ? 'bg-dark-900 border-dark-700' : ''}`}>
                  <h2 className={`text-xl font-display font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'} mb-6`}>Quick Actions</h2>
                  <div className="space-y-3">
                    <Link to="/book">
                      <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 text-left border-2 ${
                        isDark 
                          ? 'bg-dark-800 border-dark-700 hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/20' 
                          : 'bg-primary-50 hover:bg-primary-100 border-transparent'
                      }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-dark-700' : 'bg-primary-100'}`}>
                          <svg className={`w-5 h-5 ${isDark ? 'text-gold-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-primary-900'}`}>Book New Appointment</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-primary-600'}`}>Schedule your next tattoo session</p>
                        </div>
                      </button>
                    </Link>
                    
                    <Link to="/ai-design">
                      <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 text-left border-2 ${
                        isDark 
                          ? 'bg-dark-800 border-dark-700 hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/20' 
                          : 'bg-accent-50 hover:bg-accent-100 border-transparent'
                      }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-dark-700' : 'bg-accent-100'}`}>
                          <svg className={`w-5 h-5 ${isDark ? 'text-neon-400' : 'text-accent-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-accent-900'}`}>Generate AI Design</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-accent-600'}`}>Create unique design concepts</p>
                        </div>
                      </button>
                    </Link>
                    
                    <Link to="/gallery">
                      <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 text-left border-2 ${
                        isDark 
                          ? 'bg-dark-800 border-dark-700 hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/20' 
                          : 'bg-secondary-50 hover:bg-secondary-100 border-transparent'
                      }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-dark-700' : 'bg-secondary-100'}`}>
                          <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-secondary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-secondary-900'}`}>Browse Gallery</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>Find inspiration from our work</p>
                        </div>
                      </button>
                    </Link>
                    
                    <Link to="/chat">
                      <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 text-left border-2 ${
                        isDark 
                          ? 'bg-dark-800 border-dark-700 hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/20' 
                          : 'bg-purple-50 hover:bg-purple-100 border-transparent'
                      }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-dark-700' : 'bg-purple-100'}`}>
                          <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-gray-200' : 'text-purple-900'}`}>Chat Support</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-purple-600'}`}>Get help with any questions</p>
                        </div>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {selectedTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-display font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'}`}>My Bookings</h2>
                <Link to="/book">
                  <Button variant="primary">
                    New Booking
                  </Button>
                </Link>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-16">
                  <LoadingSpinner size="large" />
                </div>
              ) : bookings.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bookings.map((booking) => {
                    const hasReview = reviews[booking._id];
                    const isCompleted = booking.status === 'completed';
                    
                    return (
                      <div key={booking._id} className={`card hover:shadow-lg transition-shadow ${
                        isDark ? 'bg-dark-900 border-dark-700' : ''
                      }`}>
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleBookingClick(booking)}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className={`font-semibold capitalize ${
                              isDark ? 'text-gray-100' : 'text-secondary-900'
                            }`}>
                              {booking.tattooStyle} Tattoo
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getStatusColor(booking.status)
                            }`}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status}</span>
                            </span>
                          </div>
                          
                          <div className={`space-y-2 text-sm ${
                            isDark ? 'text-gray-300' : 'text-secondary-600'
                          }`}>
                            <p><span className="font-medium">Date:</span> {formatDate(booking.preferredDate)}</p>
                            <p><span className="font-medium">Time:</span> {formatTime(booking.preferredTime)}</p>
                            <p><span className="font-medium">Placement:</span> <span className="capitalize">{booking.bodyPlacement}</span></p>
                            <p><span className="font-medium">Size:</span> <span className="capitalize">{booking.size}</span></p>
                          </div>
                          
                          <div className={`mt-3 pt-3 border-t ${
                            isDark ? 'border-dark-700' : 'border-secondary-200'
                          }`}>
                            <p className={`text-sm line-clamp-2 ${
                              isDark ? 'text-gray-400' : 'text-secondary-700'
                            }`}>{booking.tattooIdea}</p>
                          </div>
                        </div>

                        {/* Cancel Button for Pending/Approved Bookings */}
                        {(booking.status === 'pending' || booking.status === 'approved') && (
                          <div className={`mt-4 pt-4 border-t ${
                            isDark ? 'border-dark-700' : 'border-secondary-200'
                          }`} onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="danger"
                              size="small"
                              onClick={() => handleCancelBooking(booking._id)}
                              className="w-full"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel Booking
                            </Button>
                          </div>
                        )}

                        {/* Review Section */}
                        {isCompleted && (
                          <div className={`mt-4 pt-4 border-t ${
                            isDark ? 'border-dark-700' : 'border-secondary-200'
                          }`} onClick={(e) => e.stopPropagation()}>
                            {hasReview ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-medium ${
                                    isDark ? 'text-gray-300' : 'text-secondary-700'
                                  }`}>Your Review</span>
                                  <StarRating rating={hasReview.rating} readonly size="small" />
                                </div>
                                {hasReview.comment && (
                                  <p className={`text-sm line-clamp-2 ${
                                    isDark ? 'text-gray-400' : 'text-secondary-600'
                                  }`}>
                                    {hasReview.comment}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="small"
                                onClick={() => handleReviewClick(booking)}
                                className="w-full"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                Write a Review
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-secondary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Bookings Yet</h3>
                  <p className="text-secondary-600 mb-6">
                    Ready to start your tattoo journey? Book your first appointment today.
                  </p>
                  <Link to="/book">
                    <Button variant="primary" size="large">
                      Book Your First Appointment
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Saved Designs Tab */}
          {selectedTab === 'designs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-display font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'}`}>Saved Designs</h2>
                <Link to="/ai-design">
                  <Button variant="primary">
                    Generate New Design
                  </Button>
                </Link>
              </div>
              
              {savedDesigns.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedDesigns.map((design) => (
                    <div 
                      key={design._id} 
                      className="card hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                      onClick={() => handleDesignClick(design)}
                    >
                      <div className="aspect-square bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg mb-4 flex items-center justify-center">
                        {design.imageUrl ? (
                          <img
                            src={design.imageUrl}
                            alt={design.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <svg className="w-12 h-12 text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-primary-600 font-medium">{design.title}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-secondary-900 mb-1">{design.title}</h3>
                        <p className="text-sm text-secondary-600 mb-2 line-clamp-2">{design.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded capitalize">
                            {design.style}
                          </span>
                          {design.aiGenerated && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                              AI Generated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-secondary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Saved Designs</h3>
                  <p className="text-secondary-600 mb-6">
                    Start creating and collecting tattoo designs to build your inspiration library.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/ai-design">
                      <Button variant="primary">
                        Generate AI Design
                      </Button>
                    </Link>
                    <Link to="/gallery">
                      <Button variant="outline">
                        Browse Gallery
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Booking Details Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={handleModalClose}
        title="Booking Details"
        size="medium"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900 capitalize">
                {selectedBooking.tattooStyle} Tattoo
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                getStatusColor(selectedBooking.status)
              }`}>
                {getStatusIcon(selectedBooking.status)}
                <span className="ml-1 capitalize">{selectedBooking.status}</span>
              </span>
            </div>
            
            {/* Appointment Details */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h4 className="font-medium text-primary-900 mb-2">Appointment Details</h4>
              <div className="space-y-1 text-sm text-primary-700">
                <p><span className="font-medium">Date:</span> {formatDate(selectedBooking.preferredDate)}</p>
                <p><span className="font-medium">Time:</span> {formatTime(selectedBooking.preferredTime)}</p>
              </div>
            </div>
            
            {/* Tattoo Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-secondary-900">Tattoo Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary-600">Style:</span>
                  <span className="ml-2 font-medium capitalize">{selectedBooking.tattooStyle}</span>
                </div>
                <div>
                  <span className="text-secondary-600">Placement:</span>
                  <span className="ml-2 font-medium capitalize">{selectedBooking.bodyPlacement}</span>
                </div>
                <div>
                  <span className="text-secondary-600">Size:</span>
                  <span className="ml-2 font-medium capitalize">{selectedBooking.size}</span>
                </div>
                <div>
                  <span className="text-secondary-600">Budget:</span>
                  <span className="ml-2 font-medium">{selectedBooking.budget}</span>
                </div>
              </div>
              
              <div>
                <span className="text-secondary-600">Description:</span>
                <p className="mt-1 text-sm text-secondary-900">{selectedBooking.tattooIdea}</p>
              </div>
              
              {selectedBooking.specialRequests && (
                <div>
                  <span className="text-secondary-600">Special Requests:</span>
                  <p className="mt-1 text-sm text-secondary-900">{selectedBooking.specialRequests}</p>
                </div>
              )}
            </div>
            
            {/* Booking Reference */}
            <div className="bg-secondary-50 rounded-lg p-4">
              <p className="text-sm text-secondary-600 mb-1">Booking Reference</p>
              <p className="font-mono text-lg font-semibold text-secondary-900">{selectedBooking._id}</p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedBooking._id);
                    alert('Booking ID copied to clipboard!');
                  }}
                  className="flex-1"
                >
                  Copy Reference
                </Button>
                
                <Link to="/chat" className="flex-1">
                  <Button variant="primary" fullWidth>
                    Contact Support
                  </Button>
                </Link>
              </div>
              
              {/* Cancel Button - Only show for pending/approved bookings */}
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'approved') && (
                <Button
                  variant="danger"
                  onClick={() => handleCancelBooking(selectedBooking._id)}
                  fullWidth
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Design Details Modal */}
      <Modal
        isOpen={showDesignModal}
        onClose={handleDesignModalClose}
        title={selectedDesign?.title}
        size="large"
      >
        {selectedDesign && (
          <div className="space-y-6">
            {/* Image */}
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center">
              {selectedDesign.imageUrl ? (
                <img
                  src={selectedDesign.imageUrl}
                  alt={selectedDesign.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <svg className="w-24 h-24 text-primary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg text-primary-600 font-medium">{selectedDesign.title}</span>
                </div>
              )}
            </div>
            
            {/* Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-secondary-900 mb-2">Description</h3>
                <p className="text-secondary-600">{selectedDesign.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-secondary-900 mb-1">Style</h4>
                  <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded capitalize">
                    {selectedDesign.style}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-secondary-900 mb-1">Created</h4>
                  <p className="text-secondary-600">{formatDate(selectedDesign.createdAt)}</p>
                </div>
              </div>
              
              {selectedDesign.aiGenerated && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h4 className="font-medium text-purple-900">AI Generated Design</h4>
                  </div>
                </div>
              )}
              
              {selectedDesign.tags && selectedDesign.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDesign.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <Link to="/booking" className="flex-1">
                <Button variant="primary" fullWidth>
                  Book This Design
                </Button>
              </Link>
              <Link to="/ai-design" className="flex-1">
                <Button variant="outline" fullWidth>
                  Customize with AI
                </Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => handleDeleteDesign(selectedDesign._id)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={handleReviewModalClose}
        onSubmit={handleReviewSubmit}
        booking={selectedBookingForReview}
      />
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useTheme } from '../../context/ThemeContext';
import { bookingService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Modal from '../../components/UI/Modal';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { loading, error, request, clearError } = useApi();
  const { isDark } = useTheme();

  const statusOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const statusUpdateOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const timeFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  // Mock bookings data for demonstration
  const mockBookings = [
    {
      _id: '1',
      userId: {
        _id: 'u1',
        name: 'John Smith',
        email: 'john@email.com',
        phone: '(555) 123-4567'
      },
      tattooStyle: 'traditional',
      placement: 'arm',
      size: 'medium',
      description: 'Traditional dragon design with vibrant colors inspired by Japanese art',
      experience: 'few',
      budget: '300-600',
      preferredDate: '2026-02-15',
      preferredTime: '14:00',
      status: 'pending',
      specialRequests: 'Prefer afternoon appointments',
      createdAt: '2026-02-10T10:30:00Z',
      updatedAt: '2026-02-10T10:30:00Z'
    },
    {
      _id: '2',
      userId: {
        _id: 'u2',
        name: 'Sarah Johnson',
        email: 'sarah@email.com',
        phone: '(555) 987-6543'
      },
      tattooStyle: 'watercolor',
      placement: 'shoulder',
      size: 'small',
      description: 'Watercolor butterfly with soft pastel colors',
      experience: 'first',
      budget: '100-300',
      preferredDate: '2026-02-18',
      preferredTime: '10:00',
      status: 'approved',
      specialRequests: 'First tattoo, nervous about pain',
      createdAt: '2026-02-09T14:20:00Z',
      updatedAt: '2026-02-10T09:15:00Z'
    },
    {
      _id: '3',
      userId: {
        _id: 'u3',
        name: 'Mike Wilson',
        email: 'mike@email.com',
        phone: '(555) 456-7890'
      },
      tattooStyle: 'geometric',
      placement: 'back',
      size: 'large',
      description: 'Complex geometric mandala covering upper back',
      experience: 'experienced',
      budget: '600+',
      preferredDate: '2026-02-20',
      preferredTime: '12:00',
      status: 'completed',
      specialRequests: 'Multiple sessions expected',
      createdAt: '2026-01-25T16:45:00Z',
      updatedAt: '2026-02-08T11:30:00Z'
    }
  ];

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const response = await request(() => bookingService.getAll({
        status: selectedStatus,
        timeFilter: selectedTimeFilter
      }));
      if (response?.data?.data?.bookings) {
        setBookings(response.data.data.bookings);
        setFilteredBookings(response.data.data.bookings);
      } else {
        setBookings(mockBookings);
        setFilteredBookings(mockBookings);
      }
    } catch (err) {
      console.log('Using mock data for bookings');
      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus, selectedTimeFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800'; // Keep for backward compatibility
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
    if (!timeString) return '';

    // If the backend stores a human-readable range like "9:00 AM - 12:00 PM",
    // return it as-is to avoid parsing errors (which produce "Invalid Date").
    if (timeString.includes('-') || /AM|PM/i.test(timeString)) {
      return timeString;
    }

    // Otherwise try to parse single time strings like "14:00".
    const parsed = new Date(`2000-01-01T${timeString}`);
    if (isNaN(parsed)) return timeString;

    return parsed.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const resolveDesignImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('data:image') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const serverBase = apiBase.replace(/\/api\/?$/, '');

    if (imageUrl.startsWith('/')) {
      return `${serverBase}${imageUrl}`;
    }

    return `${serverBase}/${imageUrl}`;
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setRejectionReason(booking.rejectionReason || '');
    setShowModal(true);
  };

  const handleStatusChange = (statusValue) => {
    setNewStatus(statusValue);

    if (statusValue !== 'rejected') {
      setRejectionReason('');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return;

    const trimmedRejectionReason = rejectionReason.trim();
    if (newStatus === 'rejected' && !trimmedRejectionReason) {
      return;
    }
    
    setIsUpdating(true);
    try {
      const statusPayload = { status: newStatus };
      if (newStatus === 'rejected') {
        statusPayload.rejectionReason = trimmedRejectionReason;
      } else {
        // Clear previous reason when moving away from rejected.
        statusPayload.rejectionReason = '';
      }

      const response = await request(() => bookingService.updateStatus(selectedBooking._id, statusPayload));
      if (!response?.success) {
        return;
      }

      const updatedBooking = response?.data?.data?.booking;
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking._id === selectedBooking._id 
          ? {
              ...booking,
              ...(updatedBooking || {}),
              status: newStatus,
              rejectionReason: newStatus === 'rejected' ? trimmedRejectionReason : '',
              updatedAt: updatedBooking?.updatedAt || new Date().toISOString()
            }
          : booking
      ));
      
      setShowModal(false);
      setSelectedBooking(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Failed to update booking status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setNewStatus('');
    setRejectionReason('');
  };

  const selectedLinkedDesign =
    selectedBooking?.tattooDesignId && typeof selectedBooking.tattooDesignId === 'object'
      ? selectedBooking.tattooDesignId
      : null;
  const isRejectionReasonMissing = newStatus === 'rejected' && !rejectionReason.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Booking Management</h1>
          <p className={`mt-1 ${isDark ? 'text-gold-300' : 'text-gray-600'}`}>Manage customer appointments and bookings</p>
        </div>
        <div className={`text-sm ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
          {filteredBookings.length} bookings
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={clearError}>
          {typeof error === 'string' ? error : 'An error occurred while loading bookings'}
        </Alert>
      )}

      {/* Filters */}
      <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select
              label="Filter by Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
          <div className="flex-1">
            <Select
              label="Filter by Time"
              value={selectedTimeFilter}
              onChange={(e) => setSelectedTimeFilter(e.target.value)}
              options={timeFilterOptions}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStatus('all');
                setSelectedTimeFilter('all');
                fetchBookings();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className={`rounded-lg shadow ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-200'}`}>
              <thead className={isDark ? 'bg-dark-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
                    Customer
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
                    Tattoo Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
                    Appointment
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'bg-dark-900 divide-dark-700' : 'bg-white divide-gray-200'}`}>
                {filteredBookings.map((booking) => {
                  const linkedDesign =
                    booking?.tattooDesignId && typeof booking.tattooDesignId === 'object'
                      ? booking.tattooDesignId
                      : null;

                  return (
                    <tr
                      key={booking._id}
                      className={`cursor-pointer ${isDark ? 'hover:bg-dark-800' : 'hover:bg-gray-50'}`}
                      onClick={() => handleBookingClick(booking)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {booking.userId?.name || 'Unknown'}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                            {booking.userId?.email || 'No email'}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                            {booking.userId?.phone || 'No phone'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`text-sm font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {booking.tattooStyle} ({booking.size})
                          </div>
                          <div className={`text-sm capitalize ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                            {booking.bodyPlacement || booking.placement}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                            {booking.estimatedPrice ? `$${booking.estimatedPrice}` : booking.budget || 'N/A'}
                          </div>
                          {linkedDesign && (
                            <div className={`mt-1 text-xs font-medium ${isDark ? 'text-neon-400' : 'text-blue-600'}`}>
                              Linked AI design
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatDate(booking.preferredDate)}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                          {formatTime(booking.preferredTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          getStatusColor(booking.status)
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                        {formatDate(booking.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gold-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No bookings found</h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
              {selectedStatus === 'all' ? 'No bookings have been made yet.' : `No ${selectedStatus} bookings found.`}
            </p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title="Booking Details"
        size="large"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className={`rounded-lg p-4 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Name</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.userId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Email</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.userId?.email || 'No email'}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Phone</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.userId?.phone || 'No phone'}</p>
                </div>
              </div>
            </div>

            {/* Tattoo Details */}
            <div>
              <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tattoo Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Style</p>
                  <p className={`text-sm capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.tattooStyle}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Placement</p>
                  <p className={`text-sm capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.bodyPlacement || selectedBooking.placement}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Size</p>
                  <p className={`text-sm capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.size}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Estimated Price</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.estimatedPrice ? `$${selectedBooking.estimatedPrice}` : selectedBooking.budget || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Tattoo Idea</p>
                <p className={`text-sm p-3 rounded ${isDark ? 'text-white bg-dark-800' : 'text-gray-900 bg-gray-50'}`}>
                  {selectedBooking.tattooIdea || selectedBooking.description || 'No description provided'}
                </p>
              </div>
              {(selectedBooking.notes || selectedBooking.specialRequests) && (
                <div className="mt-4">
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Customer Notes</p>
                  <p className={`text-sm p-3 rounded ${isDark ? 'text-white bg-dark-800' : 'text-gray-900 bg-gray-50'}`}>
                    {selectedBooking.notes || selectedBooking.specialRequests}
                  </p>
                </div>
              )}
            </div>

            {selectedLinkedDesign && (
              <div className={`rounded-lg p-4 ${isDark ? 'bg-dark-800 border border-neon-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Linked AI Design</h3>
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Title</p>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedLinkedDesign.title || 'Untitled design'}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Style</p>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedLinkedDesign.style || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Description</p>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedLinkedDesign.description || 'No description available'}</p>
                  </div>
                  {selectedLinkedDesign.imageUrl && (
                    <div>
                      <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Preview</p>
                      <img
                        src={resolveDesignImageUrl(selectedLinkedDesign.imageUrl)}
                        alt={selectedLinkedDesign.title || 'Linked tattoo design'}
                        className="max-h-56 w-full rounded-lg border border-gray-300 object-contain bg-white"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Appointment Info */}
            <div className={`rounded-lg p-4 ${isDark ? 'bg-dark-800' : 'bg-blue-50'}`}>
              <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Appointment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Date</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedBooking.preferredDate)}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Time</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.preferredTime}</p>
                </div>
                {selectedBooking.estimatedDuration && (
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Estimated Duration</p>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.estimatedDuration} hours</p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            {selectedBooking.adminNotes && (
              <div className={`rounded-lg p-4 ${isDark ? 'bg-dark-800 border border-yellow-500/30' : 'bg-yellow-50'}`}>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Admin Notes</p>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.adminNotes}</p>
              </div>
            )}

            {/* Rejection Reason */}
            {selectedBooking.rejectionReason && (
              <div className={`rounded-lg p-4 ${isDark ? 'bg-dark-800 border border-blood-500/30' : 'bg-red-50'}`}>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Rejection Reason</p>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.rejectionReason}</p>
              </div>
            )}

            {/* Status Update */}
            <div>
              <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Update Status</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Select
                    value={newStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    options={statusUpdateOptions}
                    label="Status"
                  />

                  {newStatus === 'rejected' && (
                    <div className="mt-4">
                      <Textarea
                        label="Rejection Reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this appointment is being rejected"
                        required
                        rows={3}
                        maxLength={500}
                        error={isRejectionReasonMissing ? 'Rejection reason is required' : ''}
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleModalClose}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleStatusUpdate}
                    loading={isUpdating}
                    disabled={isUpdating || newStatus === selectedBooking.status || isRejectionReasonMissing}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            </div>

            {/* Booking Reference */}
            <div className={`rounded-lg p-3 ${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}>
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>Booking ID</p>
              <p className={`text-sm font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedBooking._id}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingManagement;
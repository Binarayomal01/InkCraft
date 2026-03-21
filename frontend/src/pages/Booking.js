import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';
import { bookingService } from '../services/api';
import { formatDate, addDays } from '../utils/helpers';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Textarea from '../components/UI/Textarea';
import Select from '../components/UI/Select';
import Alert from '../components/UI/Alert';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Booking = () => {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const clearError = () => setError(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/book' } } });
    }
  }, [isAuthenticated, navigate]);

  const tattooStyles = [
    { value: 'Traditional', label: 'Traditional' },
    { value: 'Realistic', label: 'Realistic' },
    { value: 'Tribal', label: 'Tribal' },
    { value: 'Geometric', label: 'Geometric' },
    { value: 'Watercolor', label: 'Watercolor' },
    { value: 'Minimalist', label: 'Minimalist' },
    { value: 'Blackwork', label: 'Blackwork' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Neo-Traditional', label: 'Neo-Traditional' },
    { value: 'Other', label: 'Other' }
  ];

  const bodyPlacements = [
    { value: 'Arm', label: 'Arm' },
    { value: 'Leg', label: 'Leg' },
    { value: 'Back', label: 'Back' },
    { value: 'Chest', label: 'Chest' },
    { value: 'Shoulder', label: 'Shoulder' },
    { value: 'Wrist', label: 'Wrist' },
    { value: 'Ankle', label: 'Ankle' },
    { value: 'Neck', label: 'Neck' },
    { value: 'Hand', label: 'Hand' },
    { value: 'Other', label: 'Other' }
  ];

  const sizes = [
    { value: 'small', label: 'Small (2-4 inches)' },
    { value: 'medium', label: 'Medium (4-8 inches)' },
    { value: 'large', label: 'Large (8+ inches)' },
    { value: 'full_sleeve', label: 'Full Sleeve' },
    { value: 'half_sleeve', label: 'Half Sleeve' }
  ];

  const validationRules = {
    tattooStyle: [(value) => !value ? 'Please select a tattoo style' : ''],
    placement: [(value) => !value ? 'Please select body placement' : ''],
    size: [(value) => !value ? 'Please select tattoo size' : ''],
    description: [
      (value) => !value ? 'Please describe your tattoo idea' : '',
      (value) => value && value.length < 10 ? 'Description must be at least 10 characters' : ''
    ],
    experience: [(value) => !value ? 'Please select your experience level' : ''],
    budget: [(value) => !value ? 'Please select your budget range' : ''],
    specialRequests: []
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    resetForm
  } = useForm(
    {
      tattooStyle: '',
      placement: '',
      size: '',
      description: '',
      experience: '',
      budget: '',
      specialRequests: ''
    },
    validationRules
  );

  // Generate available dates (next 30 days, excluding Sundays)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, i);
      // Skip Sundays (0)
      if (date.getDay() !== 0) {
        dates.push({
          value: formatDate(date, 'YYYY-MM-DD'),
          label: formatDate(date, 'MMMM DD, YYYY'),
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
        });
      }
    }
    return dates;
  };

  // Generate time slots for selected date
  const generateTimeSlots = (date) => {
    const slots = [];
    const selectedDay = new Date(date).getDay();
    
    // Different hours for different days
    let startHour, endHour;
    if (selectedDay === 6) { // Saturday
      startHour = 10;
      endHour = 18;
    } else { // Monday-Friday
      startHour = 9;
      endHour = 17;
    }
    
    for (let hour = startHour; hour < endHour; hour += 2) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        value: timeString,
        label: new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      });
    }
    
    return slots;
  };

  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate);
      setAvailableSlots(slots);
      setSelectedTime(''); // Reset time when date changes
    }
  }, [selectedDate]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateAll()) {
        return;
      }
    }
    
    if (step === 2) {
      if (!selectedDate || !selectedTime) {
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    clearError();
  };

  const handleSubmitBooking = async () => {
    // Map frontend fields to backend expected fields
    const bookingData = {
      tattooIdea: values.description, // Backend expects 'tattooIdea'
      tattooStyle: values.tattooStyle, // Already capitalized from select options
      bodyPlacement: values.placement, // Already capitalized from select options
      size: getSizeLabel(values.size), // Convert to backend enum format
      preferredDate: selectedDate,
      preferredTime: getTimeSlot(selectedTime), // Convert to backend enum format
      notes: values.specialRequests || ''
    };

    setLoading(true);
    setError(null);

    try {
      const response = await bookingService.create(bookingData);
      console.log('Booking response:', response.data); // Debug log
      
      // Backend returns: { success: true, data: { booking: {...} } }
      if (response?.data?.data?.booking) {
        setBookingId(response.data.data.booking._id);
        setShowConfirmation(true);
      } else if (response?.data?.booking) {
        // Fallback in case structure is different
        setBookingId(response.data.booking._id);
        setShowConfirmation(true);
      } else {
        console.error('Unexpected response structure:', response.data);
        setError('Booking created but unable to retrieve booking details.');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get size label for backend
  const getSizeLabel = (size) => {
    const sizeMap = {
      'small': 'Small (2-4 inches)',
      'medium': 'Medium (4-8 inches)',
      'large': 'Large (8+ inches)',
      'full_sleeve': 'Full Sleeve/Back',
      'half_sleeve': 'Large (8+ inches)'
    };
    return sizeMap[size] || size;
  };

  // Helper function to convert time to backend enum format
  const getTimeSlot = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 9 && hour < 12) return '9:00 AM - 12:00 PM';
    if (hour >= 12 && hour < 15) return '12:00 PM - 3:00 PM';
    if (hour >= 15 && hour < 18) return '3:00 PM - 6:00 PM';
    return '6:00 PM - 9:00 PM';
  };

  const handleStartOver = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setShowConfirmation(false);
    setBookingId(null);
    resetForm();
    clearError();
  };

  if (!isAuthenticated) {
    return <LoadingSpinner size="large" />;
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full">
          <div className="card text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Booking Confirmed!</h2>
            <p className="text-secondary-600 mb-6">
              Thank you for booking with InkCraft. Your consultation has been scheduled and we'll contact you within 24 hours to confirm the details.
            </p>
            
            {bookingId && (
              <div className="bg-secondary-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-secondary-600 mb-1">Booking Reference</p>
                <p className="font-mono text-lg font-semibold text-secondary-900">{bookingId}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={() => navigate('/dashboard')}
              >
                View My Bookings
              </Button>
              
              <Button
                variant="outline"
                size="large"
                fullWidth
                onClick={handleStartOver}
              >
                Book Another Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
      {/* Header */}
      <section className={isDark ? 'gradient-bg-hero text-white py-12' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12'}>
        <div className="container-max">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Tattoo</h1>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-200' : 'text-blue-100'}`}>
              Schedule your consultation and bring your tattoo vision to life with our expert artists.
            </p>
          </div>
        </div>
      </section>

      {/* Progress Indicator */}
      <div className={`border-b sticky top-20 z-10 ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'}`}>
        <div className="container-max py-6">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber
                    ? isDark ? 'bg-gold-500 text-dark-950' : 'bg-blue-600 text-white'
                    : isDark ? 'bg-dark-700 text-gray-500' : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNumber}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= stepNumber ? (isDark ? 'text-gold-500' : 'text-blue-600') : (isDark ? 'text-gray-500' : 'text-gray-500')
                }`}>
                  {stepNumber === 1 ? 'Details' : stepNumber === 2 ? 'Schedule' : 'Review'}
                </span>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 ml-4 ${
                    step > stepNumber ? (isDark ? 'bg-gold-500' : 'bg-blue-600') : (isDark ? 'bg-dark-700' : 'bg-gray-200')
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <section className="section-padding">
        <div className="container-max max-w-2xl">
          {error && (
            <Alert type="error" onClose={clearError} className="mb-8">
              {error}
            </Alert>
          )}

          {/* Step 1: Tattoo Details */}
          {step === 1 && (
            <div className="card">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">Tell Us About Your Tattoo</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Tattoo Style"
                    value={values.tattooStyle}
                    onChange={(e) => handleChange('tattooStyle', e.target.value)}
                    onBlur={() => handleBlur('tattooStyle')}
                    error={touched.tattooStyle ? errors.tattooStyle : ''}
                    options={tattooStyles}
                    placeholder="Select a style"
                    required
                  />
                  
                  <Select
                    label="Body Placement"
                    value={values.placement}
                    onChange={(e) => handleChange('placement', e.target.value)}
                    onBlur={() => handleBlur('placement')}
                    error={touched.placement ? errors.placement : ''}
                    options={bodyPlacements}
                    placeholder="Select placement"
                    required
                  />
                </div>
                
                <Select
                  label="Tattoo Size"
                  value={values.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  onBlur={() => handleBlur('size')}
                  error={touched.size ? errors.size : ''}
                  options={sizes}
                  placeholder="Select size"
                  required
                />
                
                <Textarea
                  label="Describe Your Tattoo Idea"
                  placeholder="Tell us about your vision, including colors, style preferences, and any reference images you have..."
                  value={values.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  error={touched.description ? errors.description : ''}
                  rows={4}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Your Tattoo Experience"
                    value={values.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    onBlur={() => handleBlur('experience')}
                    error={touched.experience ? errors.experience : ''}
                    options={[
                      { value: 'first', label: 'This is my first tattoo' },
                      { value: 'few', label: 'I have 1-3 tattoos' },
                      { value: 'experienced', label: 'I have 4+ tattoos' },
                      { value: 'collector', label: 'I\'m a tattoo collector' }
                    ]}
                    placeholder="Select experience"
                    required
                  />
                  
                  <Select
                    label="Budget Range"
                    value={values.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    onBlur={() => handleBlur('budget')}
                    error={touched.budget ? errors.budget : ''}
                    options={[
                      { value: '100-300', label: '$100 - $300' },
                      { value: '300-600', label: '$300 - $600' },
                      { value: '600-1000', label: '$600 - $1,000' },
                      { value: '1000+', label: '$1,000+' },
                      { value: 'discuss', label: 'Discuss with artist' }
                    ]}
                    placeholder="Select budget"
                    required
                  />
                </div>
                
                <Textarea
                  label="Special Requests or Questions"
                  placeholder="Any allergies, skin conditions, specific artist preferences, or other requests..."
                  value={values.specialRequests}
                  onChange={(e) => handleChange('specialRequests', e.target.value)}
                  rows={3}
                  optional
                />
                
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="large"
                    onClick={handleNextStep}
                    disabled={!isValid}
                  >
                    Continue to Scheduling
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div className="card">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">Choose Your Appointment</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Select Date
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {generateAvailableDates().slice(0, 12).map((date) => (
                      <button
                        key={date.value}
                        type="button"
                        onClick={() => setSelectedDate(date.value)}
                        className={`p-3 text-left rounded-lg border transition-all duration-200 ${
                          selectedDate === date.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-25'
                        }`}
                      >
                        <div className="font-medium">{date.dayName}</div>
                        <div className="text-sm text-secondary-600">{date.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-3">
                      Select Time
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => setSelectedTime(slot.value)}
                          className={`p-3 text-center rounded-lg border transition-all duration-200 ${
                            selectedTime === slot.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-25'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Booking Information</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Initial consultations are free and typically last 30-60 minutes</li>
                        <li>• We'll discuss your design, pricing, and schedule the tattoo session</li>
                        <li>• Studio hours: Mon-Fri 9AM-5PM, Sat 10AM-6PM, Closed Sundays</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                  >
                    Back to Details
                  </Button>
                  
                  <Button
                    type="button"
                    variant="primary"
                    size="large"
                    onClick={handleNextStep}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Review Booking
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <div className="card">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">Review Your Booking</h2>
              
              <div className="space-y-6">
                {/* Personal Info */}
                <div className="bg-secondary-50 rounded-lg p-4">
                  <h3 className="font-semibold text-secondary-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-secondary-600">Name:</span>
                      <span className="ml-2 font-medium">{user?.name}</span>
                    </div>
                    <div>
                      <span className="text-secondary-600">Email:</span>
                      <span className="ml-2 font-medium">{user?.email}</span>
                    </div>
                    <div>
                      <span className="text-secondary-600">Phone:</span>
                      <span className="ml-2 font-medium">{user?.phone}</span>
                    </div>
                  </div>
                </div>
                
                {/* Tattoo Details */}
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-3">Tattoo Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-secondary-600">Style:</span>
                      <span className="ml-2 font-medium capitalize">{values.tattooStyle}</span>
                    </div>
                    <div>
                      <span className="text-secondary-600">Placement:</span>
                      <span className="ml-2 font-medium capitalize">{values.placement}</span>
                    </div>
                    <div>
                      <span className="text-secondary-600">Size:</span>
                      <span className="ml-2 font-medium">{sizes.find(s => s.value === values.size)?.label}</span>
                    </div>
                    <div>
                      <span className="text-secondary-600">Budget:</span>
                      <span className="ml-2 font-medium">{values.budget}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-secondary-600">Description:</span>
                    <p className="mt-1 text-sm text-secondary-900">{values.description}</p>
                  </div>
                  {values.specialRequests && (
                    <div className="mt-3">
                      <span className="text-secondary-600">Special Requests:</span>
                      <p className="mt-1 text-sm text-secondary-900">{values.specialRequests}</p>
                    </div>
                  )}
                </div>
                
                {/* Appointment Details */}
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-3">Appointment</h3>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-primary-900">
                          {formatDate(new Date(selectedDate), 'MMMM DD, YYYY')}
                        </p>
                        <p className="text-primary-700">
                          {availableSlots.find(slot => slot.value === selectedTime)?.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                  >
                    Back to Schedule
                  </Button>
                  
                  <Button
                    type="button"
                    variant="primary"
                    size="large"
                    onClick={handleSubmitBooking}
                    loading={loading}
                    disabled={loading}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Booking;
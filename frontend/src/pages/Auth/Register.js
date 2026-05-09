import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useForm } from '../../hooks/useForm';
import { isValidEmail, isValidPhone, isValidPassword } from '../../utils/helpers';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Alert from '../../components/UI/Alert';

const Register = () => {
  const { isDark } = useTheme();
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('error');
  const [alertMessage, setAlertMessage] = useState('');
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validationRules = {
    name: [
      (value) => !value ? 'Name is required' : '',
      (value) => value && value.length < 2 ? 'Name must be at least 2 characters' : ''
    ],
    email: [
      (value) => !value ? 'Email is required' : '',
      (value) => value && !isValidEmail(value) ? 'Please enter a valid email' : ''
    ],
    phone: [
      (value) => !value ? 'Phone number is required' : '',
      (value) => value && !isValidPhone(value) ? 'Please enter a valid phone number' : ''
    ],
    gender: [
      (value) => !value ? 'Gender is required' : ''
    ],
    password: [
      (value) => !value ? 'Password is required' : '',
      (value) => value && !isValidPassword(value) ? 'Password must be at least 6 characters' : ''
    ],
    confirmPassword: [
      (value) => !value ? 'Please confirm your password' : '',
      (value, allValues) => value && value !== allValues.password ? 'Passwords do not match' : ''
    ]
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateAll
  } = useForm(
    {
      name: '',
      email: '',
      phone: '',
      gender: '',
      password: '',
      confirmPassword: ''
    },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    const userData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      gender: values.gender,
      password: values.password
    };

    const result = await register(userData);
    
    if (result.success) {
      setAlertType('success');
      setAlertMessage('Registration successful! Welcome to InkCraft.');
      setShowAlert(true);
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } else {
      setAlertType('error');
      setAlertMessage(result.error || 'Registration failed. Please try again.');
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    clearError();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gradient-to-br from-dark-950 via-dark-900 to-dark-850' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className={isDark ? 'w-12 h-12 bg-gradient-to-br from-gold-500 to-blood-600 rounded-lg flex items-center justify-center shadow-glow-gold' : 'w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'}>
              <span className="text-white font-bold text-2xl">I</span>
            </div>
            <span className={`font-display text-3xl font-bold ${isDark ? 'text-gradient-gold' : 'text-gray-900'}`}>
              InkCraft
            </span>
          </Link>
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create your account</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Join InkCraft and start your tattoo journey</p>
        </div>

        {/* Success/Error Alert */}
        {showAlert && (
          <Alert type={alertType} onClose={handleAlertClose} className="mb-6">
            {alertMessage}
          </Alert>
        )}

        {/* Registration Form */}
        <div className={`card ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              error={touched.name ? errors.name : ''}
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={touched.email ? errors.email : ''}
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              error={touched.phone ? errors.phone : ''}
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
            />

            <Select
              label="Gender"
              placeholder="Select your gender"
              value={values.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              onBlur={() => handleBlur('gender')}
              error={touched.gender ? errors.gender : ''}
              options={['Male', 'Female', 'Other']}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password ? errors.password : ''}
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              error={touched.confirmPassword ? errors.confirmPassword : ''}
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-secondary-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              disabled={!isValid || isLoading}
            >
              Create Account
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-4">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Already have an account?{' '}
            <Link to="/login" className={isDark ? 'text-gold-500 hover:text-gold-400 font-medium' : 'text-blue-600 hover:text-blue-500 font-medium'}>
              Sign in here
            </Link>
          </p>
          
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <Link to="/" className={isDark ? 'hover:text-gray-300' : 'hover:text-gray-700'}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
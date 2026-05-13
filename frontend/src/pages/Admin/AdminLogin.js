import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useForm } from '../../hooks/useForm';
import { isValidEmail } from '../../utils/helpers';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Alert from '../../components/UI/Alert';

const AdminLogin = () => {
  const [showAlert, setShowAlert] = useState(false);
  const { adminLogin, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validationRules = {
    email: [
      (value) => !value ? 'Email is required' : '',
      (value) => value && !isValidEmail(value) ? 'Please enter a valid email' : ''
    ],
    password: [
      (value) => !value ? 'Password is required' : '',
      (value) => value && value.length < 6 ? 'Password must be at least 6 characters' : ''
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
      email: '',
      password: ''
    },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    const result = await adminLogin(values.email, values.password);
    
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setShowAlert(true);
        clearError();
      }
    } else {
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    clearError();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isDark ? 'gradient-bg-hero' : 'bg-gradient-to-br from-red-50 to-orange-50'
    }`}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center ${
              isDark ? 'from-blood-600 to-blood-700 shadow-glow-blood' : 'from-red-600 to-orange-600'
            }`}>
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <span className={`font-display text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'}`}>
              Admin Portal
            </span>
          </Link>
          <h2 className={`text-3xl font-display font-bold ${isDark ? 'text-gray-100' : 'text-secondary-900'} mb-2`}>Admin Sign In</h2>
          <p className={isDark ? 'text-gray-300' : 'text-secondary-600'}>Access the administrative dashboard</p>
        </div>

        {/* Error Alert */}
        {(error || showAlert) && (
          <Alert type="error" onClose={handleAlertClose} className="mb-6">
            {error || 'Access denied. Admin privileges required.'}
          </Alert>
        )}

        {/* Login Form */}
        <div className={`card ${isDark ? 'bg-dark-900 border-dark-700' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Admin Email"
              type="email"
              placeholder="Enter your admin email"
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
              label="Password"
              type="password"
              placeholder="Enter your password"
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

            <Button
              type="submit"
              variant="danger"
              size="large"
              fullWidth
              loading={isLoading}
              disabled={!isValid || isLoading}
            >
              Sign In to Admin Portal
            </Button>
          </form>

          <div className={`mt-6 pt-6 border-t ${isDark ? 'border-dark-700' : 'border-secondary-200'}`}>
            <div className={`rounded-lg p-4 border ${
              isDark 
                ? 'bg-amber-500/10 border-amber-500/30' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start space-x-3">
                <svg className={`w-5 h-5 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  <p className="font-medium mb-1">Admin Access Only</p>
                  <p>This portal is restricted to authorized administrators. Unauthorized access attempts are logged.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-4">
          <div className={`flex items-center justify-center space-x-4 text-sm ${
            isDark ? 'text-gray-400' : 'text-secondary-500'
          }`}>
            <Link to="/" className={`transition-colors ${isDark ? 'hover:text-gold-500' : 'hover:text-secondary-700'}`}>
              Back to Website
            </Link>
            <span>•</span>
            <Link to="/login" className={`transition-colors ${isDark ? 'hover:text-gold-500' : 'hover:text-secondary-700'}`}>
              User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
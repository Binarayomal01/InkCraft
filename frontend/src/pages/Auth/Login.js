import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useForm } from '../../hooks/useForm';
import { isValidEmail } from '../../utils/helpers';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Alert from '../../components/UI/Alert';

const Login = () => {
  const { isDark } = useTheme();
  const [showAlert, setShowAlert] = useState(false);
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

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

    const result = await login(values.email, values.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
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
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome back</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Sign in to your account to continue</p>
        </div>

        {/* Error Alert */}
        {error && showAlert && (
          <Alert type="error" onClose={handleAlertClose} className="mb-6">
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <div className={`card ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              disabled={!isValid || isLoading}
            >
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-4">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Don't have an account?{' '}
            <Link to="/register" className={isDark ? 'text-gold-500 hover:text-gold-400 font-medium' : 'text-blue-600 hover:text-blue-500 font-medium'}>
              Sign up for free
            </Link>
          </p>
          
          <div className={`flex items-center justify-center space-x-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <Link to="/" className={isDark ? 'hover:text-gray-300' : 'hover:text-gray-700'}>
              Back to Home
            </Link>
            <span>•</span>
            <Link to="/admin/login" className={isDark ? 'hover:text-gray-300' : 'hover:text-gray-700'}>
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
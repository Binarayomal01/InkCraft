import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { authAPI, handleApiError } from '../../utils/api';
import { useForm } from '../../hooks/useForm';
import { isValidEmail } from '../../utils/helpers';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Alert from '../../components/UI/Alert';

const ForgotPassword = () => {
  const { isDark } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  const validationRules = {
    email: [
      (value) => !value ? 'Email is required' : '',
      (value) => value && !isValidEmail(value) ? 'Please enter a valid email' : ''
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
      email: ''
    },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    setShowAlert(false);

    try {
      const response = await authAPI.forgotPassword(values.email);
      setAlertType('success');
      setAlertMessage(response.data.message || 'If that email exists, a reset link has been sent.');
      setShowAlert(true);
    } catch (error) {
      const parsedError = handleApiError(error);
      setAlertType('error');
      setAlertMessage(parsedError.message || 'Failed to request password reset.');
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gradient-to-br from-dark-950 via-dark-900 to-dark-850' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className={isDark ? 'w-12 h-12 bg-gradient-to-br from-gold-500 to-blood-600 rounded-lg flex items-center justify-center shadow-glow-gold' : 'w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'}>
              <span className="text-white font-bold text-2xl">I</span>
            </div>
            <span className={`font-display text-3xl font-bold ${isDark ? 'text-gradient-gold' : 'text-gray-900'}`}>
              InkCraft
            </span>
          </Link>
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Forgot password?</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {showAlert && (
          <Alert type={alertType} onClose={() => setShowAlert(false)} className="mb-6">
            {alertMessage}
          </Alert>
        )}

        <div className={`card ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your account email"
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

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              Send Reset Link
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center space-y-2">
          <Link to="/login" className={isDark ? 'text-gold-500 hover:text-gold-400 font-medium' : 'text-blue-600 hover:text-blue-500 font-medium'}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

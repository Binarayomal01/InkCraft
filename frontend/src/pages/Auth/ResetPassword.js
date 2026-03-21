import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { authAPI, handleApiError } from '../../utils/api';
import { useForm } from '../../hooks/useForm';
import { isValidPassword } from '../../utils/helpers';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Alert from '../../components/UI/Alert';

const ResetPassword = () => {
  const { isDark } = useTheme();
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  const validationRules = {
    password: [
      (value) => !value ? 'New password is required' : '',
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

    if (!token) {
      setAlertType('error');
      setAlertMessage('Missing reset token. Please use the link from your email.');
      setShowAlert(true);
      return;
    }

    setIsSubmitting(true);
    setShowAlert(false);

    try {
      const response = await authAPI.resetPassword(token, values.password);
      setAlertType('success');
      setAlertMessage(response.data.message || 'Password reset successful. Redirecting to login...');
      setShowAlert(true);

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      const parsedError = handleApiError(error);
      setAlertType('error');
      setAlertMessage(parsedError.message || 'Failed to reset password.');
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
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Reset your password</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Set a new password for your account.
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
              label="New Password"
              type="password"
              placeholder="Enter new password"
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
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
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

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              Reset Password
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

export default ResetPassword;

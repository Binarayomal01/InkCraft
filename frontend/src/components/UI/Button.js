import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-950';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 text-white focus:ring-blood-500 shadow-glow-red hover:shadow-glow-red disabled:opacity-50 disabled:cursor-not-allowed',
    gold: 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-dark-950 focus:ring-gold-500 shadow-glow-gold disabled:opacity-50',
    outline: 'border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-dark-950 focus:ring-gold-500 disabled:opacity-50',
    ghost: 'text-gray-300 hover:text-white hover:bg-dark-800 focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-500 disabled:opacity-50',
    secondary: 'bg-dark-800 hover:bg-dark-700 text-gray-200 border border-dark-600 hover:border-gold-500/50 focus:ring-gold-500'
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const isDisabled = disabled || loading;

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${isDisabled ? 'cursor-not-allowed' : 'transform hover:scale-105'}
    ${className}
  `;

  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="small" color={variant === 'primary' || variant === 'gold' || variant === 'danger' ? 'white' : 'gold'} />
      ) : (
        <>
          {leftIcon && (
            <span className="mr-2">{leftIcon}</span>
          )}
          {children}
          {rightIcon && (
            <span className="ml-2">{rightIcon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
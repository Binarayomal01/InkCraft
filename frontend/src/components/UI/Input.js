import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  fullWidth = true,
  leftIcon = null,
  rightIcon = null,
  className = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}, ref) => {
  const inputClasses = `
    ${fullWidth ? 'w-full' : ''}
    px-4 py-3 
    bg-dark-800 border rounded-lg 
    text-gray-100 placeholder-gray-500
    transition-all duration-300
    focus:outline-none 
    focus:ring-2 
    focus:ring-gold-500 
    focus:border-gold-500
    focus:bg-dark-700
    disabled:bg-dark-900
    disabled:cursor-not-allowed
    disabled:opacity-50
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-dark-600 hover:border-dark-500 focus:shadow-glow-gold/20'
    }
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${inputClassName}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className={`block text-sm font-semibold text-gray-300 mb-2 tracking-wide ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-lg">{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-500 text-lg">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
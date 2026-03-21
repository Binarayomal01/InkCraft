import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  fullWidth = true,
  className = '',
  labelClassName = '',
  selectClassName = '',
  ...props
}, ref) => {
  const selectClasses = `
    ${fullWidth ? 'w-full' : ''}
    px-4 py-3 
    bg-dark-800 border rounded-lg 
    text-gray-100
    transition-all duration-300
    focus:outline-none 
    focus:ring-2 
    focus:ring-gold-500 
    focus:border-gold-500
    focus:bg-dark-700
    focus:shadow-glow-gold/20
    disabled:bg-dark-900
    disabled:cursor-not-allowed
    disabled:opacity-50
    appearance-none
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-dark-600 hover:border-dark-500'
    }
    ${selectClassName}
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
        <select
          ref={ref}
          required={required}
          disabled={disabled}
          className={selectClasses}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option 
              key={typeof option === 'string' ? option : option.value || index} 
              value={typeof option === 'string' ? option : option.value}
            >
              {typeof option === 'string' ? option : option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
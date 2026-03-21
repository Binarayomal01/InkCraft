import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  fullWidth = true,
  className = '',
  labelClassName = '',
  textareaClassName = '',
  maxLength = null,
  ...props
}, ref) => {
  const textareaClasses = `
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
    focus:shadow-glow-gold/20
    disabled:bg-dark-900
    disabled:cursor-not-allowed
    disabled:opacity-50
    resize-vertical
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-dark-600 hover:border-dark-500'
    }
    ${textareaClassName}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className={`block text-sm font-semibold text-gray-300 mb-2 tracking-wide ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={textareaClasses}
        {...props}
      />
      
      {maxLength && (
        <div className="flex justify-between items-center mt-1">
          <div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {props.value?.length || 0}/{maxLength}
          </p>
        </div>
      )}
      
      {!maxLength && error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
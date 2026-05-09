import React from 'react';

const Card = ({ 
  children, 
  title, 
  variant = 'default',
  className = '', 
  ...props 
}) => {
  const variantClasses = {
    default: 'bg-dark-850 border-dark-700 hover:border-gold-500/30 hover:shadow-glow-gold/20',
    glass: 'bg-dark-900/60 backdrop-blur-lg border-gray-700/50 hover:shadow-glow-gold/10',
    highlight: 'bg-gradient-to-br from-dark-800 to-dark-900 border-gold-500/50 shadow-glow-gold/30'
  };

  return (
    <div 
      className={`rounded-xl shadow-xl border transition-all duration-300 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-dark-700">
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
      )}
      <div className={title ? "px-6 py-4" : "p-6"}>
        {children}
      </div>
    </div>
  );
};

export default Card;
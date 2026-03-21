import React, { useState } from 'react';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'medium' }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10'
  };

  const handleStarClick = (starRating) => {
    if (!readonly) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (starNumber) => {
    const filled = starNumber <= (hoveredRating || rating);
    
    return (
      <button
        key={starNumber}
        type="button"
        onClick={() => handleStarClick(starNumber)}
        onMouseEnter={() => !readonly && setHoveredRating(starNumber)}
        onMouseLeave={() => !readonly && setHoveredRating(0)}
        disabled={readonly}
        className={`
          ${sizeClasses[size]} 
          transition-all duration-200 
          ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
        `}
        aria-label={`Rate ${starNumber} stars`}
      >
        <svg
          viewBox="0 0 24 24"
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          className={`
            w-full h-full transition-colors duration-200
            ${filled ? 'text-yellow-400' : 'text-gray-400'}
          `}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    );
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
};

export default StarRating;

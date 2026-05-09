import React from 'react';
import StarRating from './StarRating';
import Card from './Card';

const ReviewCard = ({ review, showBookingDetails = false, onEdit, onDelete, isOwnReview = false }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:border-primary-500/30 transition-colors duration-300">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                {review.userId?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h4 className="font-medium text-gray-200">
                  {review.userId?.name || 'Anonymous'}
                </h4>
                <p className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>
            
            <StarRating rating={review.rating} readonly size="small" />
          </div>

          {/* Actions */}
          {isOwnReview && (
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(review)}
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                  aria-label="Edit review"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(review._id)}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  aria-label="Delete review"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comment */}
        {review.comment && (
          <p className="text-gray-300 leading-relaxed">
            {review.comment}
          </p>
        )}

        {/* Booking Details (optional) */}
        {showBookingDetails && review.bookingId && (
          <div className="pt-4 border-t border-dark-600">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Booking:</span>{' '}
              {review.bookingId.tattooStyle} - {review.bookingId.bodyPlacement} ({review.bookingId.size})
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReviewCard;

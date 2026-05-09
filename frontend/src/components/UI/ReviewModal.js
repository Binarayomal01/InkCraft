import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Textarea from './Textarea';
import StarRating from './StarRating';
import Alert from './Alert';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  booking,
  existingReview = null 
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please provide a review comment of at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      handleClose();
    } catch (error) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(existingReview?.rating || 0);
    setComment(existingReview?.comment || '');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={existingReview ? 'Edit Your Review' : 'Write a Review'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Booking Info */}
        <div className="bg-dark-800 p-4 rounded-lg border border-dark-600">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Booking Details</h4>
          <div className="space-y-1 text-sm text-gray-400">
            <p><span className="text-gray-500">Style:</span> {booking?.tattooStyle}</p>
            <p><span className="text-gray-500">Placement:</span> {booking?.bodyPlacement}</p>
            <p><span className="text-gray-500">Size:</span> {booking?.size}</p>
            <p><span className="text-gray-500">Date:</span> {new Date(booking?.preferredDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <StarRating 
              rating={rating} 
              onRatingChange={setRating}
              size="large"
            />
            {rating > 0 && (
              <span className="text-sm text-gray-400">
                {rating} out of 5 stars
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with us... What did you like? How was the service?"
            rows={5}
            maxLength={1000}
            className="resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {comment.length}/1000 characters (minimum 10)
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || rating === 0}
            loading={isSubmitting}
            className="flex-1"
          >
            {existingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;

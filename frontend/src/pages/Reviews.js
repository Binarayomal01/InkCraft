import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Alert from '../components/UI/Alert';
import ReviewCard from '../components/UI/ReviewCard';
import StarRating from '../components/UI/StarRating';
import Card from '../components/UI/Card';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { isDark } = useTheme();

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getAll({ limit: 100, sortBy: '-createdAt' });
      setReviews(response.data.data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reviewService.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(filter));

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-secondary-50'}`}>
      {/* Hero Section */}
      <section className={`${isDark ? 'gradient-bg-hero border-b border-dark-700' : 'bg-white border-b'} py-16`}>
        <div className="container-max">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className={`text-4xl md:text-5xl font-display font-bold mb-4 ${
              isDark ? 'text-gray-100' : 'text-secondary-900'
            }`}>
              Customer Reviews
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-secondary-600'}`}>
              See what our clients have to say about their tattoo experience
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="text-center">
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-primary-500 mb-2">
                    {stats.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  <StarRating rating={Math.round(stats.averageRating || 0)} readonly size="medium" />
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>
                    Average Rating
                  </p>
                </div>
              </Card>

              <Card className="text-center">
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-primary-500 mb-2">
                    {stats.totalReviews || 0}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>
                    Total Reviews
                  </p>
                </div>
              </Card>

              <Card className="text-center">
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-primary-500 mb-2">
                    {stats.fiveStarCount || 0}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-secondary-600'}`}>
                    5-Star Reviews
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section-padding">
        <div className="container-max">
          {error && (
            <Alert type="error" onClose={() => setError(null)} className="mb-6">
              {error}
            </Alert>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : isDark
                  ? 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                  : 'bg-white text-secondary-600 hover:bg-secondary-50 border'
              }`}
            >
              All Reviews
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilter(rating.toString())}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  filter === rating.toString()
                    ? 'bg-primary-500 text-white'
                    : isDark
                    ? 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                    : 'bg-white text-secondary-600 hover:bg-secondary-50 border'
                }`}
              >
                {rating} <span className="text-yellow-400">★</span>
              </button>
            ))}
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredReviews.map((review) => (
                <ReviewCard 
                  key={review._id} 
                  review={review}
                  showBookingDetails={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-secondary-900'}`}>
                {filter === 'all' ? 'No reviews yet' : `No ${filter}-star reviews yet`}
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-secondary-600'}>
                {filter === 'all' 
                  ? 'Be the first to share your experience!' 
                  : 'Try selecting a different rating filter'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reviews;

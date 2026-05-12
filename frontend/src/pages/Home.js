import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/UI/Button';
import { tattooDesignService } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Home = () => {
  const [recentDesigns, setRecentDesigns] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const { isDark } = useTheme();

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.style.opacity = '1';
        }
      });
    }, observerOptions);

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const features = document.querySelectorAll('.feature-card');
      const galleryItems = document.querySelectorAll('.gallery-item');
      
      features.forEach(feature => {
        observer.observe(feature);
        // Check if already in viewport
        const rect = feature.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          feature.classList.add('animate-fade-in');
          feature.style.opacity = '1';
        }
      });
      
      galleryItems.forEach(item => {
        observer.observe(item);
        // Check if already in viewport
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          item.classList.add('animate-fade-in');
          item.style.opacity = '1';
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, [recentDesigns]);

  // Fetch recent designs from database
  useEffect(() => {
    const fetchRecentDesigns = async () => {
      try {
        const response = await tattooDesignService.getAll();
        if (response?.data?.data?.designs) {
          // Get the 4 most recent designs
          const latest = response.data.data.designs.slice(0, 4);
          setRecentDesigns(latest);
        }
      } catch (error) {
        console.log('Error fetching recent designs:', error);
      } finally {
        setLoadingDesigns(false);
      }
    };

    fetchRecentDesigns();
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
      {/* Hero Section */}
      <section 
        className={`section-padding ${isDark ? 'gradient-bg-hero' : 'bg-gradient-to-br from-blue-600 to-purple-700'} text-white relative overflow-hidden`}
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          opacity: 1 - scrollY / 600
        }}
      >
        <div className="container-max relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-white mb-6 animate-fade-in">
              Transform Your Vision Into 
              <span className={`block ${isDark ? 'text-gradient-gold glow-text-gold' : 'text-yellow-300'}`}>Stunning Artwork</span>
            </h1>
            <p className={`text-xl mb-8 leading-relaxed animate-slide-up animation-delay-200 ${isDark ? 'text-gray-300' : 'text-white'}`}>
              Professional tattoo studio offering custom designs, expert artistry, and exceptional service. 
              Experience the art of tattooing at its finest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-400">
              <Link to="/book">
                <Button variant="primary" size="large" className="w-full sm:w-auto">
                  Book Consultation
                </Button>
              </Link>
              <Link to="/gallery">
                <Button variant="outline" size="large" className="w-full sm:w-auto">
                  View Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`section-padding ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Why Choose InkCraft?</h2>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              We combine traditional artistry with modern technology to deliver exceptional tattooing experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center feature-card opacity-0 transition-all duration-700" style={{ transitionDelay: '0ms' }}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-gold-500/20 shadow-glow-gold' : 'bg-blue-100'}`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-gold-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Expert Artists</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Our certified tattoo artists bring years of experience and unique artistic vision to every piece.
              </p>
            </div>
            
            <div className="text-center feature-card opacity-0 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-gold-500/20 shadow-glow-gold' : 'bg-blue-100'}`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-gold-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>AI-Powered Design</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Use our innovative AI design generator to visualize and customize your perfect tattoo before booking.
              </p>
            </div>
            
            <div className="text-center feature-card opacity-0 transition-all duration-700" style={{ transitionDelay: '400ms' }}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-gold-500/20 shadow-glow-gold' : 'bg-blue-100'}`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-gold-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Safety First</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                We maintain the highest health and safety standards with sterile equipment and licensed professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className={`section-padding ${isDark ? 'bg-dark-850' : 'bg-white'}`}>
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Work</h2>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Explore our portfolio of custom tattoos and artistic designs.
            </p>
          </div>
          
          {loadingDesigns ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : recentDesigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {recentDesigns.map((design, index) => (
                <Link 
                  key={design._id} 
                  to="/gallery"
                  className="card gallery-item opacity-0 hover:scale-105 transition-all duration-500"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-dark-700 to-dark-800 rounded-lg mb-4 flex items-center justify-center relative">
                    {design.thumbnailUrl || design.imageUrl ? (
                      <img
                        src={design.thumbnailUrl || design.imageUrl}
                        alt={design.title}
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="text-center">
                        <svg className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gold-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={`text-sm font-medium ${isDark ? 'text-gold-500' : 'text-blue-600'}`}>{design.title}</span>
                        {design.hasImage && (
                          <span className={`block text-xs mt-2 ${isDark ? 'text-gold-400' : 'text-blue-500'}`}>
                            📷 Has image
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{design.title}</h4>
                  <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{design.description}</p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded capitalize ${isDark ? 'bg-gold-500/20 text-gold-400' : 'bg-blue-100 text-blue-700'}`}>
                    {design.style}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No designs available yet.</p>
              <Link to="/gallery">
                <Button variant="outline">
                  Explore Gallery
                </Button>
              </Link>
            </div>
          )}
          
          <div className="text-center">
            <Link to="/gallery">
              <Button variant="primary">
                View Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`section-padding ${isDark ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-blood-900/20' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-red-900/20'} text-white`}>
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-white mb-6">Ready to Start Your Tattoo Journey?</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Book a consultation today and let our expert artists bring your vision to life. 
              Experience the difference of professional artistry and personalized service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book">
                <Button variant="primary" size="large">
                  Book Consultation
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" size="large" className="border-white text-white hover:bg-white hover:text-secondary-900">
                  Chat with Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { tattooDesignService } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Alert from '../components/UI/Alert';

const Gallery = () => {
  const { isDark } = useTheme();
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  
  const { loading, error, request } = useApi();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const styles = [
    { value: 'all', label: 'All Styles' },
    { value: 'Traditional', label: 'Traditional' },
    { value: 'Realistic', label: 'Realistic' },
    { value: 'Tribal', label: 'Tribal' },
    { value: 'Geometric', label: 'Geometric' },
    { value: 'Watercolor', label: 'Watercolor' },
    { value: 'Minimalist', label: 'Minimalist' },
    { value: 'Blackwork', label: 'Blackwork' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Neo-Traditional', label: 'Neo-Traditional' },
    { value: 'Abstract', label: 'Abstract' }
  ];

  // Sample designs for demonstration (updated to match backend format)
  const sampleDesigns = [
    {
      _id: '1',
      title: 'Rose Realistic',
      style: 'Realistic',
      description: 'Detailed realistic rose with intricate shading and highlights',
      imageUrl: null,
      tags: ['flower', 'realistic', 'detailed'],
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'Dragon Traditional',
      style: 'Traditional',
      description: 'Classic traditional dragon design with bold lines and vibrant colors',
      imageUrl: null,
      tags: ['dragon', 'mythology', 'colorful'],
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      title: 'Geometric Mandala',
      style: 'Geometric',
      description: 'Sacred geometric mandala pattern with perfect symmetry',
      imageUrl: null,
      tags: ['mandala', 'symmetry', 'spiritual'],
      createdAt: new Date().toISOString()
    },
    {
      _id: '4',
      title: 'Wolf Tribal',
      style: 'Tribal',
      description: 'Bold tribal wolf design with flowing curves and sharp edges',
      imageUrl: null,
      tags: ['wolf', 'animal', 'bold'],
      createdAt: new Date().toISOString()
    },
    {
      _id: '5',
      title: 'Watercolor Bird',
      style: 'Watercolor',
      description: 'Artistic watercolor-style bird with soft color transitions',
      imageUrl: null,
      tags: ['bird', 'artistic', 'colorful'],
      createdAt: new Date().toISOString()
    },
    {
      _id: '6',
      title: 'Minimalist Arrow',
      style: 'Minimalist',
      description: 'Clean and simple arrow design with perfect proportions',
      imageUrl: null,
      tags: ['arrow', 'simple', 'clean'],
      createdAt: new Date().toISOString()
    }
  ];

  // Fetch designs
  const fetchDesigns = async () => {
    try {
      console.log('[Gallery] Fetching designs from API...');
      const response = await request(() => tattooDesignService.getAll());
      console.log('[Gallery] Full API Response:', response);
      console.log('[Gallery] Response structure check:');
      console.log('  - response?.data:', !!response?.data);
      console.log('  - response?.data?.data:', !!response?.data?.data);
      console.log('  - response?.data?.data?.designs:', !!response?.data?.data?.designs);
      console.log('  - designs length:', response?.data?.data?.designs?.length || 0);
      
      // Check for designs in the correct nested structure
      if (response?.data?.data?.designs && response.data.data.designs.length > 0) {
        console.log('[Gallery] ✓ Loaded designs from API:', response.data.data.designs.length);
        setDesigns(response.data.data.designs);
        setFilteredDesigns(response.data.data.designs);
      } else if (response?.data?.designs && response.data.designs.length > 0) {
        // Alternative structure
        console.log('[Gallery] ✓ Loaded designs from API (alt structure):', response.data.designs.length);
        setDesigns(response.data.designs);
        setFilteredDesigns(response.data.designs);
      } else if (response?.success && response?.data?.data?.designs?.length === 0) {
        // API successful but no gallery designs - use sample data
        console.log('[Gallery] ⚠ No gallery designs from API, using sample data');
        setDesigns(sampleDesigns);
        setFilteredDesigns(sampleDesigns);
      } else {
        // Use sample data if no designs from API
        console.log('[Gallery] ⚠ No designs from API, using sample data');
        console.log('[Gallery] Response was:', JSON.stringify(response, null, 2));
        setDesigns(sampleDesigns);
        setFilteredDesigns(sampleDesigns);
      }
    } catch (err) {
      console.error('[Gallery] ✗ Error fetching designs:', err);
      console.error('[Gallery] Error details:', err.response || err.message);
      console.log('[Gallery] Using sample data due to API error');
      setDesigns(sampleDesigns);
      setFilteredDesigns(sampleDesigns);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for gallery items
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

    setTimeout(() => {
      const galleryItems = document.querySelectorAll('.gallery-item');
      
      galleryItems.forEach(item => {
        observer.observe(item);
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          item.classList.add('animate-fade-in');
          item.style.opacity = '1';
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, [filteredDesigns]);

  // Filter designs by style
  useEffect(() => {
    if (selectedStyle === 'all') {
      setFilteredDesigns(designs);
    } else {
      setFilteredDesigns(designs.filter(design => design.style === selectedStyle));
    }
  }, [selectedStyle, designs]);

  const handleDesignClick = async (design) => {
    // If design doesn't have full image data, fetch it from the API
    if (design.hasImage && !design.imageUrl) {
      try {
        console.log('[Gallery] Fetching full design details for:', design.title);
        // Call API directly without using the shared useApi hook
        const response = await tattooDesignService.getById(design._id);
        console.log('[Gallery] Full design response:', response);
        
        // Extract the design from the nested response structure
        const fullDesign = response?.data?.data || response?.data || design;
        console.log('[Gallery] Setting design with imageUrl:', fullDesign.imageUrl ? 'Yes' : 'No');
        setSelectedDesign(fullDesign);
      } catch (error) {
        console.error('[Gallery] Error fetching design details:', error);
        setSelectedDesign(design);
      }
    } else {
      setSelectedDesign(design);
    }
    setShowModal(true);
    setSaveMessage(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDesign(null);
    setSaveMessage(null);
  };

  const handleSaveDesign = async () => {
    if (!isAuthenticated) {
      setSaveMessage({ type: 'error', text: 'Please login to save designs' });
      setTimeout(() => {
        navigate('/login', { state: { from: '/gallery' } });
      }, 1500);
      return;
    }

    if (!selectedDesign) return;
    
    try {
      const designData = {
        title: selectedDesign.title,
        description: selectedDesign.description,
        style: selectedDesign.style,
        imageUrl: selectedDesign.imageUrl,
        tags: selectedDesign.tags || [],
        aiGenerated: selectedDesign.aiGenerated || false
      };
      
      await request(() => tattooDesignService.create(designData));
      setSaveMessage({ type: 'success', text: 'Design saved to your collection!' });
      
      // Refresh gallery to show updated designs
      await fetchDesigns();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Save design error:', err);
      
      // Check for duplicate error (409 conflict)
      if (err.response?.status === 409) {
        setSaveMessage({ 
          type: 'error', 
          text: 'You have already saved this design to your collection!' 
        });
      } else {
        setSaveMessage({ 
          type: 'error', 
          text: err.response?.data?.message || 'Failed to save design. Please try again.' 
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <section 
        className={`py-16 ${isDark ? 'gradient-bg-hero' : 'bg-gradient-to-br from-blue-600 to-purple-700'} text-white relative overflow-hidden`}
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: 1 - scrollY / 800
        }}
      >
        <div className="container-max relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tattoo Gallery</h1>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-white'}`}>
              Explore our collection of stunning tattoo designs across various styles and inspirations.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className={`py-8 sticky top-20 z-10 ${isDark ? 'bg-dark-900 border-b border-dark-700' : 'bg-white border-b border-gray-200'}`}>
        <div className="container-max">
          <div className="flex flex-wrap gap-2 justify-center">
            {styles.map((style) => (
              <button
                key={style.value}
                onClick={() => setSelectedStyle(style.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedStyle === style.value
                    ? isDark ? 'bg-gold-500 text-dark-950' : 'bg-blue-600 text-white'
                    : isDark ? 'bg-dark-850 text-gray-300 hover:bg-dark-800 hover:text-gold-500' : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-max">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <LoadingSpinner size="large" />
            </div>
          ) : error && designs.length === 0 ? (
            <Alert type="error" className="mb-8">
              Failed to load designs. Please try again later.
            </Alert>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-8">
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Showing {filteredDesigns.length} design{filteredDesigns.length !== 1 ? 's' : ''}
                  {selectedStyle !== 'all' && ` in ${styles.find(s => s.value === selectedStyle)?.label}`}
                </p>
              </div>

              {/* Designs Grid */}
              {filteredDesigns.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDesigns.map((design, index) => (
                    <div
                      key={design._id}
                      className="group cursor-pointer gallery-item opacity-0 transition-all duration-500"
                      style={{ transitionDelay: `${(index % 12) * 80}ms` }}
                      onClick={() => handleDesignClick(design)}
                    >
                      <div className={`card hover:shadow-lg transition-all duration-300 group-hover:scale-105 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
                        {/* Image Placeholder */}
                        <div className={`aspect-square rounded-lg mb-4 flex items-center justify-center transition-colors duration-300 relative ${isDark ? 'bg-gradient-to-br from-gold-500/10 to-blood-500/10 group-hover:from-gold-500/20 group-hover:to-blood-500/20' : 'bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200'}`}>
                          {design.imageUrl ? (
                            <img
                              src={design.imageUrl}
                              alt={design.title}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="text-center">
                              <svg className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gold-500' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className={`text-sm font-medium ${isDark ? 'text-gold-500' : 'text-blue-600'}`}>{design.title}</span>
                              {design.hasImage && (
                                <span className={`block text-xs mt-2 ${isDark ? 'text-gold-400' : 'text-blue-500'}`}>
                                  🖼️ Click to view image
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Design Info */}
                        <div>
                          <h3 className={`font-semibold mb-1 transition-colors duration-200 ${isDark ? 'text-white group-hover:text-gold-500' : 'text-gray-900 group-hover:text-blue-600'}`}>
                            {design.title}
                          </h3>
                          <p className={`text-sm mb-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {design.description}
                          </p>
                          
                          {/* Style Badge */}
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded capitalize ${isDark ? 'bg-gold-500/20 text-gold-400' : 'bg-blue-100 text-blue-700'}`}>
                            {design.style}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Designs Found</h3>
                  <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No designs match your current filter. Try selecting a different style.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setSelectedStyle('all')}
                  >
                    View All Designs
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Design Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedDesign?.title}
        size="large"
      >
        {selectedDesign && (
          <div className="space-y-6">
            {/* Image */}
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center">
              {selectedDesign.imageUrl ? (
                <img
                  src={selectedDesign.imageUrl}
                  alt={selectedDesign.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <svg className="w-24 h-24 text-primary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg text-primary-600 font-medium">{selectedDesign.title}</span>
                </div>
              )}
            </div>
            
            {/* Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-secondary-900 mb-2">Description</h3>
                <p className="text-secondary-600">{selectedDesign.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-secondary-900 mb-1">Style</h4>
                  <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded capitalize">
                    {selectedDesign.style}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-secondary-900 mb-1">Created</h4>
                  <p className="text-secondary-600">{formatDate(selectedDesign.createdAt)}</p>
                </div>
              </div>
              
              {selectedDesign.tags && selectedDesign.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDesign.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Save Message */}
            {saveMessage && (
              <Alert type={saveMessage.type} className="mb-4">
                {saveMessage.text}
              </Alert>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleSaveDesign}
                className="flex-1"
              >
                {isAuthenticated ? 'Save to My Designs' : 'Login to Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleModalClose();
                  navigate('/booking');
                }}
                className="flex-1"
              >
                Book Similar Design
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleModalClose();
                  navigate('/ai-design');
                }}
                className="flex-1"
              >
                Customize with AI
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Gallery;
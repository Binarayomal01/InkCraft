import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useTheme } from '../../context/ThemeContext';
import { tattooDesignService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Textarea from '../../components/UI/Textarea';
import Select from '../../components/UI/Select';

const DesignManagement = () => {
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingDesignId, setEditingDesignId] = useState(null);
  
  const { loading, error, request, clearError } = useApi();
  const { isDark } = useTheme();

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
    { value: 'Abstract', label: 'Abstract' },
    { value: 'Biomechanical', label: 'Biomechanical' },
    { value: 'Portrait', label: 'Portrait' },
    { value: 'Other', label: 'Other' }
  ];

  // Mock designs data for demonstration
  const mockDesigns = [
    {
      _id: '1',
      title: 'Dragon Masterpiece',
      description: 'Intricate traditional dragon design with vibrant colors and detailed scales',
      style: 'Traditional',
      imageUrl: null,
      tags: ['dragon', 'traditional', 'colorful', 'detailed'],
      aiGenerated: false,
      createdBy: {
        _id: 'artist1',
        name: 'Master Artist'
      },
      createdAt: '2026-02-01T10:30:00Z',
      updatedAt: '2026-02-05T14:20:00Z'
    },
    {
      _id: '2',
      title: 'Geometric Flow',
      description: 'Modern geometric pattern with flowing lines and perfect symmetry',
      style: 'Geometric',
      imageUrl: null,
      tags: ['geometric', 'modern', 'symmetry', 'lines'],
      aiGenerated: true,
      prompt: 'Create a geometric tattoo with flowing curves and sharp angles',
      createdBy: {
        _id: 'ai',
        name: 'AI Generator'
      },
      createdAt: '2026-02-08T16:45:00Z',
      updatedAt: '2026-02-08T16:45:00Z'
    },
    {
      _id: '3',
      title: 'Watercolor Butterfly',
      description: 'Delicate butterfly with watercolor effects and soft gradients',
      style: 'Watercolor',
      imageUrl: null,
      tags: ['butterfly', 'watercolor', 'delicate', 'gradients'],
      aiGenerated: false,
      createdBy: {
        _id: 'artist2',
        name: 'Color Specialist'
      },
      createdAt: '2026-01-28T11:15:00Z',
      updatedAt: '2026-01-30T09:30:00Z'
    }
  ];

  // Mock form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    style: '',
    category: '',
    size: '',
    difficulty: '',
    estimatedTime: '',
    estimatedPrice: '',
    tags: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch designs
  const fetchDesigns = async () => {
    try {
      console.log('[DesignManagement] Fetching designs from API...');
      const response = await request(() => tattooDesignService.getAll());
      console.log('[DesignManagement] API Response:', response);
      console.log('[DesignManagement] Response data structure:', {
        hasData: !!response?.data,
        hasDataData: !!response?.data?.data,
        hasDesigns: !!response?.data?.data?.designs,
        designsLength: response?.data?.data?.designs?.length || 0
      });
      
      if (response?.data?.data?.designs) {
        console.log('[DesignManagement] ✓ Loading', response.data.data.designs.length, 'designs from API');
        setDesigns(response.data.data.designs);
      } else {
        console.log('[DesignManagement] ⚠ No designs in response, using mock data');
        setDesigns(mockDesigns);
      }
    } catch (err) {
      console.error('[DesignManagement] ✗ Error fetching designs:', err);
      console.error('[DesignManagement] Error details:', err.response?.data || err.message);
      console.log('[DesignManagement] Using mock data for designs');
      setDesigns(mockDesigns);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  // Filter and search designs
  useEffect(() => {
    let filtered = designs;
    
    // Filter by style
    if (selectedStyle !== 'all') {
      filtered = filtered.filter(design => design.style === selectedStyle);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(design => 
        design.title.toLowerCase().includes(query) ||
        design.description.toLowerCase().includes(query) ||
        design.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredDesigns(filtered);
  }, [selectedStyle, searchQuery, designs]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDesignClick = (design) => {
    setSelectedDesign(design);
    setShowModal(true);
  };

  const handleCreateDesign = () => {
    setEditMode(false);
    setEditingDesignId(null);
    setFormData({ 
      title: '', 
      description: '', 
      style: '', 
      category: '',
      size: '',
      difficulty: '',
      estimatedTime: '',
      estimatedPrice: '',
      tags: '' 
    });
    setSelectedImage(null);
    setImagePreview(null);
    setShowCreateModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }
      
      // Check file size (max 2MB for better performance)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        alert('Image size should be less than 2MB for optimal performance. Please compress or resize your image.');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        alert('Error reading image file. Please try another image.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    // If we're editing and had an existing image, restore the preview to the original
    if (editMode && editingDesignId) {
      const currentDesign = designs.find(d => d._id === editingDesignId);
      setImagePreview(currentDesign?.imageUrl || null);
    } else {
      setImagePreview(null);
    }
  };

  const handleEditDesign = (design) => {
    setEditMode(true);
    setEditingDesignId(design._id);
    setFormData({
      title: design.title || '',
      description: design.description || '',
      style: design.style || '',
      category: design.category || '',
      size: design.size || '',
      difficulty: design.difficulty || '',
      estimatedTime: design.estimatedTime || '',
      estimatedPrice: design.estimatedPrice || '',
      tags: Array.isArray(design.tags) ? design.tags.join(', ') : ''
    });
    // Don't set selectedImage - this ensures we only upload when user selects a new image
    setSelectedImage(null);
    // Keep the existing image URL for preview
    setImagePreview(design.imageUrl || null);
    setShowModal(false);
    setShowCreateModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.style || 
        !formData.category || !formData.size || !formData.difficulty || 
        !formData.estimatedTime || !formData.estimatedPrice) return;
    
    setIsSubmitting(true);
    clearError();
    try {
      const designData = {
        title: formData.title,
        description: formData.description,
        style: formData.style,
        category: formData.category,
        size: formData.size,
        difficulty: formData.difficulty,
        estimatedTime: parseFloat(formData.estimatedTime),
        estimatedPrice: parseFloat(formData.estimatedPrice),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        colors: 'Black & Grey', // Default color scheme
        bodyPlacements: ['Arm'], // Default body placement
        aiGenerated: false
      };
      
      // Only include image if a NEW image was selected (not just showing preview of existing)
      if (selectedImage instanceof File) {
        console.log('Converting new image to base64...');
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            designData.imageUrl = reader.result;
            console.log('Image converted, size:', reader.result.length);
            resolve();
          };
        });
      } else if (!editMode) {
        // For new designs without image, use null
        designData.imageUrl = null;
      }
      // For edits without new image, don't send imageUrl field at all (will keep existing)
      
      if (editMode && editingDesignId) {
        // Update existing design
        console.log('Updating design:', editingDesignId, 'Has new image:', !!selectedImage);
        const response = await request(() => tattooDesignService.update(editingDesignId, designData));
        
        if (response?.data?.data?.design) {
          // Update local state with backend response
          setDesigns(prev => prev.map(design => 
            design._id === editingDesignId 
              ? response.data.data.design
              : design
          ));
        } else {
          // Fallback update
          setDesigns(prev => prev.map(design => 
            design._id === editingDesignId 
              ? { ...design, ...designData, updatedAt: new Date().toISOString() }
              : design
          ));
        }
      } else {
        // Create new design
        console.log('=== FRONTEND: Creating new design ===');
        console.log('Design data to send:', JSON.stringify(designData, null, 2));
        console.log('Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
        console.log('Token value:', localStorage.getItem('token')?.substring(0, 20) + '...');
        
        try {
          console.log('Calling tattooDesignService.create...');
          const response = await request(() => tattooDesignService.create(designData));
          console.log('Response received:', response);
          console.log('Response success:', response?.success);
          console.log('Response data:', response?.data);
          
          // Check if request failed
          if (response?.success === false) {
            console.error('Request failed:', response.error);
            // Extract error details
            const errorDetails = response.error;
            const errorMessage = errorDetails?.errors 
              ? (Array.isArray(errorDetails.errors) ? errorDetails.errors.join(', ') : errorDetails.errors)
              : errorDetails?.message || 'Failed to create design';
            throw new Error(errorMessage);
          }
          
          // Check for successful response with design data
          if (response?.data?.data?.design) {
            console.log('Design created successfully, adding to local state');
            // Add to local state from backend response
            setDesigns(prev => [response.data.data.design, ...prev]);
          } else if (response?.success) {
            console.log('Response successful but unexpected format:', response);
            // Fallback to mock data
            const newDesign = {
              _id: Date.now().toString(),
              ...designData,
              createdBy: { _id: 'admin', name: 'Admin' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setDesigns(prev => [newDesign, ...prev]);
          } else {
            console.error('Unexpected response format:', response);
            throw new Error('Unexpected response format from server');
          }
        } catch (createError) {
          console.error('Error during create operation:', createError);
          console.error('Error type:', createError.constructor.name);
          console.error('Error message:', createError.message);
          throw createError;
        }
      }
      
      setShowCreateModal(false);
      setFormData({ 
        title: '', 
        description: '', 
        style: '', 
        category: '',
        size: '',
        difficulty: '',
        estimatedTime: '',
        estimatedPrice: '',
        tags: '' 
      });
      setSelectedImage(null);
      setImagePreview(null);
      setEditMode(false);
      setEditingDesignId(null);
    } catch (err) {
      console.error(`Failed to ${editMode ? 'update' : 'create'} design:`, err);
      
      // Display specific error messages
      let errorMessage = `Failed to ${editMode ? 'update' : 'create'} design. `;
      
      if (err.message) {
        errorMessage += err.message;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. The image might be too large. Try a smaller image (under 2MB).';
      } else if (err.response?.status === 413) {
        errorMessage += 'Image is too large. Please use an image under 2MB.';
      } else if (err.response?.status === 400) {
        errorMessage += 'Invalid data. Please check all fields.';
      } else if (err.response?.status === 401) {
        errorMessage += 'You are not authorized. Please log in again.';
      } else if (!navigator.onLine) {
        errorMessage += 'No internet connection. Please check your network.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDesign = async (designId) => {
    if (!window.confirm('Are you sure you want to delete this design?')) return;
    
    try {
      // Use admin delete endpoint for admin users
      await request(() => tattooDesignService.adminDelete(designId));
      setDesigns(prev => prev.filter(design => design._id !== designId));
      setShowModal(false);
    } catch (err) {
      console.error('Failed to delete design:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Design Management</h1>
          <p className={`mt-1 ${isDark ? 'text-gold-300' : 'text-gray-600'}`}>Manage tattoo designs and portfolio</p>
        </div>
        <Button variant="primary" onClick={handleCreateDesign}>
          Add New Design
        </Button>
      </div>

      {error && (
        <Alert type="error" onClose={clearError}>
          {typeof error === 'string' ? error : 'An error occurred while loading designs'}
        </Alert>
      )}

      {/* Filters and Search */}
      <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Search Designs"
            placeholder="Search by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          
          <Select
            label="Filter by Style"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            options={styles}
          />
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStyle('all');
                setSearchQuery('');
                fetchDesigns();
              }}
              fullWidth
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        <div className={`mt-4 flex justify-between items-center text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
          <span>{filteredDesigns.length} design(s) found</span>
        </div>
      </div>

      {/* Designs Grid */}
      <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDesigns.map((design) => (
              <div
                key={design._id}
                className="cursor-pointer group"
                onClick={() => handleDesignClick(design)}
              >
                <div className={`rounded-lg overflow-hidden transition-shadow ${isDark ? 'bg-dark-800 border border-dark-700 hover:shadow-lg hover:shadow-gold-500/20' : 'bg-white border border-gray-200 hover:shadow-lg'}`}>
                  {/* Image Placeholder */}
                  <div className={`aspect-square flex items-center justify-center transition-colors relative ${
                    isDark ? 'bg-dark-700 group-hover:bg-dark-600' : 'bg-gradient-to-br from-primary-100 to-accent-100 group-hover:from-primary-200 group-hover:to-accent-200'
                  }`}>
                    {design.imageUrl && !design.imageUrl.endsWith('...') && design.imageUrl.length > 200 ? (
                      <img
                        src={design.imageUrl}
                        alt={design.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {  
                          e.target.style.display = 'none';
                          e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                        }}
                      />
                    ) : null}
                    <div className={`text-center ${design.imageUrl && !design.imageUrl.endsWith('...') && design.imageUrl.length > 200 ? 'hidden' : ''}`}>
                      <svg className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gold-400' : 'text-primary-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className={`text-sm font-medium ${isDark ? 'text-gold-300' : 'text-primary-600'}`}>{design.title}</span>
                      {design.hasImage && (
                        <span className={`block text-xs mt-1 ${isDark ? 'text-gold-400/70' : 'text-primary-500/70'}`}>
                          Has image
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{design.title}</h3>
                      {design.aiGenerated && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          AI
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm line-clamp-2 mb-3 ${isDark ? 'text-gold-300' : 'text-gray-600'}`}>
                      {design.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        isDark ? 'bg-gold-500/20 text-gold-300' : 'bg-primary-100 text-primary-700'
                      }`}>
                        {design.style}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
                        {formatDate(design.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gold-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No designs found</h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
              {searchQuery || selectedStyle !== 'all' 
                ? 'Try adjusting your filters or search query.' 
                : 'Get started by adding your first design.'
              }
            </p>
            <div className="mt-6">
              <Button variant="primary" onClick={handleCreateDesign}>
                Add New Design
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Design Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Design Details"
        size="large"
      >
        {selectedDesign && (
          <div className="space-y-6">
            {/* Image */}
            <div className={`aspect-video rounded-lg flex items-center justify-center relative ${
              isDark ? 'bg-dark-700' : 'bg-gradient-to-br from-primary-100 to-accent-100'
            }`}>
              {selectedDesign.imageUrl ? (
                <img
                  src={selectedDesign.imageUrl}
                  alt={selectedDesign.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}
              {(!selectedDesign.imageUrl || true) && (
                <div className="text-center absolute">
                  <svg className={`w-24 h-24 mx-auto mb-4 ${isDark ? 'text-gold-400' : 'text-primary-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-lg font-medium ${isDark ? 'text-gold-300' : 'text-primary-600'}`}>{selectedDesign.title}</span>
                </div>
              )}
            </div>
            
            {/* Details */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDesign.title}</h3>
                <p className={isDark ? 'text-gold-300' : 'text-gray-600'}>{selectedDesign.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-medium mb-1 ${isDark ? 'text-gold-400' : 'text-gray-900'}`}>Style</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    isDark ? 'bg-gold-500/20 text-gold-300' : 'bg-primary-100 text-primary-700'
                  }`}>
                    {selectedDesign.style}
                  </span>
                </div>
                
                <div>
                  <h4 className={`font-medium mb-1 ${isDark ? 'text-gold-400' : 'text-gray-900'}`}>Created By</h4>
                  <p className={isDark ? 'text-white' : 'text-gray-600'}>{selectedDesign.createdBy?.name || 'Unknown'}</p>
                </div>
                
                <div>
                  <h4 className={`font-medium mb-1 ${isDark ? 'text-gold-400' : 'text-gray-900'}`}>Created</h4>
                  <p className={isDark ? 'text-white' : 'text-gray-600'}>{formatDate(selectedDesign.createdAt)}</p>
                </div>
                
                <div>
                  <h4 className={`font-medium mb-1 ${isDark ? 'text-gold-400' : 'text-gray-900'}`}>Type</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedDesign.aiGenerated 
                      ? isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                      : isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedDesign.aiGenerated ? 'AI Generated' : 'Artist Created'}
                  </span>
                </div>
              </div>
              
              {selectedDesign.tags && selectedDesign.tags.length > 0 && (
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gold-400' : 'text-gray-900'}`}>Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDesign.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${
                          isDark ? 'bg-dark-700 text-gold-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDesign.prompt && (
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gold-400' : 'text-gray-900'}`}>AI Prompt</h4>
                  <p className={`text-sm p-3 rounded ${isDark ? 'text-white bg-dark-800' : 'text-gray-600 bg-gray-50'}`}>{selectedDesign.prompt}</p>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
              
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleEditDesign(selectedDesign)}
                >
                  Edit
                </Button>
                <Button
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleDeleteDesign(selectedDesign._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Design Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditMode(false);
          setEditingDesignId(null);
          setFormData({ 
            title: '', 
            description: '', 
            style: '', 
            category: '',
            size: '',
            difficulty: '',
            estimatedTime: '',
            estimatedPrice: '',
            tags: '' 
          });
          setSelectedImage(null);
          setImagePreview(null);
        }}
        title={editMode ? "Edit Design" : "Add New Design"}
        size="medium"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Design Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter design title"
            required
          />
          
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the design..."
            rows={3}
            required
          />
          
          <Select
            label="Style"
            value={formData.style}
            onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
            options={styles.filter(s => s.value !== 'all')}
            placeholder="Select a style"
            required
          />
          
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            options={[
              { value: 'Animals', label: 'Animals' },
              { value: 'Nature', label: 'Nature' },
              { value: 'Symbols', label: 'Symbols' },
              { value: 'Text/Quotes', label: 'Text/Quotes' },
              { value: 'Portraits', label: 'Portraits' },
              { value: 'Abstract', label: 'Abstract' },
              { value: 'Geometric', label: 'Geometric' },
              { value: 'Cultural', label: 'Cultural' },
              { value: 'Religious', label: 'Religious' },
              { value: 'Fantasy', label: 'Fantasy' },
              { value: 'Horror', label: 'Horror' },
              { value: 'Other', label: 'Other' }
            ]}
            placeholder="Select a category"
            required
          />
          
          <Select
            label="Size"
            value={formData.size}
            onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
            options={[
              { value: 'Small (2-4 inches)', label: 'Small (2-4 inches)' },
              { value: 'Medium (4-8 inches)', label: 'Medium (4-8 inches)' },
              { value: 'Large (8+ inches)', label: 'Large (8+ inches)' },
              { value: 'Extra Large (12+ inches)', label: 'Extra Large (12+ inches)' }
            ]}
            placeholder="Select size"
            required
          />
          
          <Select
            label="Difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
            options={[
              { value: 'Beginner', label: 'Beginner' },
              { value: 'Intermediate', label: 'Intermediate' },
              { value: 'Advanced', label: 'Advanced' },
              { value: 'Expert', label: 'Expert' }
            ]}
            placeholder="Select difficulty"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimated Time (hours)"
              type="number"
              step="0.5"
              min="0.5"
              max="20"
              value={formData.estimatedTime}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
              placeholder="e.g. 2.5"
              required
            />
            
            <Input
              label="Estimated Price ($)"
              type="number"
              min="50"
              max="5000"
              value={formData.estimatedPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedPrice: e.target.value }))}
              placeholder="e.g. 500"
              required
            />
          </div>
          
          <Input
            label="Tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="Enter comma-separated tags"
          />
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Design Image {editMode && '(optional - keep empty to retain current image)'}
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                {selectedImage && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    New Image
                  </span>
                )}
                {editMode && !selectedImage && (
                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Current Image
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  title={selectedImage ? "Remove new image" : "Remove image"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">Click to upload image</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 2MB</span>
                </label>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditMode(false);
                setEditingDesignId(null);
                setFormData({ 
                  title: '', 
                  description: '', 
                  style: '', 
                  category: '',
                  size: '',
                  difficulty: '',
                  estimatedTime: '',
                  estimatedPrice: '',
                  tags: '' 
                });
                setSelectedImage(null);
                setImagePreview(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={!formData.title || !formData.description || !formData.style || 
                       !formData.category || !formData.size || !formData.difficulty || 
                       !formData.estimatedTime || !formData.estimatedPrice || isSubmitting}
            >
              {isSubmitting 
                ? (selectedImage ? 'Uploading image...' : (editMode ? 'Updating...' : 'Creating...'))
                : (editMode ? 'Update Design' : 'Create Design')
              }
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DesignManagement;
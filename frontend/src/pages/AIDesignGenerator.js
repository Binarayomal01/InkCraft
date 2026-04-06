import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../context/ThemeContext';
import { useForm } from '../hooks/useForm';
import { tattooDesignService } from '../services/api';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Textarea from '../components/UI/Textarea';
import Select from '../components/UI/Select';
import Alert from '../components/UI/Alert';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const AIDesignGenerator = () => {
  const { isDark } = useTheme();
  const [generatedDesign, setGeneratedDesign] = useState(null);
  const [savedDesignId, setSavedDesignId] = useState(null);
  const [previewImageFailed, setPreviewImageFailed] = useState(false);
  const [designHistory, setDesignHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { loading, error, request, clearError } = useApi();
  const navigate = useNavigate();

  const styles = [
    { value: 'traditional', label: 'Traditional' },
    { value: 'realism', label: 'Realism' },
    { value: 'tribal', label: 'Tribal' },
    { value: 'geometric', label: 'Geometric' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'blackwork', label: 'Blackwork' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'biomechanical', label: 'Biomechanical' },
    { value: 'dotwork', label: 'Dotwork' }
  ];

  const themes = [
    { value: 'nature', label: 'Nature & Animals' },
    { value: 'mythology', label: 'Mythology & Fantasy' },
    { value: 'abstract', label: 'Abstract & Patterns' },
    { value: 'spiritual', label: 'Spiritual & Symbolic' },
    { value: 'cultural', label: 'Cultural & Traditional' },
    { value: 'modern', label: 'Modern & Futuristic' },
    { value: 'vintage', label: 'Vintage & Classic' },
    { value: 'personal', label: 'Personal & Custom' }
  ];

  const sizes = [
    { value: 'small', label: 'Small (2-4 inches)' },
    { value: 'medium', label: 'Medium (4-8 inches)' },
    { value: 'large', label: 'Large (8+ inches)' }
  ];

  const bodyPlacements = [
    { value: 'arm', label: 'Arm' },
    { value: 'leg', label: 'Leg' },
    { value: 'back', label: 'Back' },
    { value: 'chest', label: 'Chest' },
    { value: 'shoulder', label: 'Shoulder' },
    { value: 'wrist', label: 'Wrist' },
    { value: 'ankle', label: 'Ankle' },
    { value: 'neck', label: 'Neck' },
    { value: 'hand', label: 'Hand' },
    { value: 'ribcage', label: 'Ribcage' },
    { value: 'hip', label: 'Hip' },
    { value: 'foot', label: 'Foot' },
    { value: 'other', label: 'Other' }
  ];

  const validationRules = {
    style: [(value) => !value ? 'Please select a style' : ''],
    theme: [(value) => !value ? 'Please select a theme' : ''],
    size: [(value) => !value ? 'Please select a size' : ''],
    bodyPlacement: [(value) => !value ? 'Please select a body placement' : ''],
    description: [
      (value) => !value ? 'Please describe your design idea' : '',
      (value) => value && value.length < 5 ? 'Description must be at least 5 characters' : ''
    ],
    colors: [],
    mood: [],
    mustInclude: [],
    avoid: []
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateAll
  } = useForm(
    {
      style: '',
      theme: '',
      size: '',
      bodyPlacement: '',
      description: '',
      colors: '',
      mood: '',
      mustInclude: '',
      avoid: ''
    },
    validationRules
  );

  const normalizeStyle = (styleValue) => {
    const styleMap = {
      traditional: 'Traditional',
      realism: 'Realistic',
      tribal: 'Tribal',
      geometric: 'Geometric',
      watercolor: 'Watercolor',
      minimalist: 'Minimalist',
      blackwork: 'Blackwork',
      japanese: 'Japanese',
      biomechanical: 'Biomechanical',
      dotwork: 'Blackwork'
    };

    return styleMap[styleValue] || 'Other';
  };

  const normalizeSize = (sizeValue) => {
    const sizeMap = {
      small: 'Small (2-4 inches)',
      medium: 'Medium (4-8 inches)',
      large: 'Large (8+ inches)'
    };

    return sizeMap[sizeValue] || 'Medium (4-8 inches)';
  };

  const normalizeBodyPlacement = (placementValue) => {
    const placementMap = {
      arm: 'Arm',
      leg: 'Leg',
      back: 'Back',
      chest: 'Chest',
      shoulder: 'Shoulder',
      wrist: 'Wrist',
      ankle: 'Ankle',
      neck: 'Neck',
      hand: 'Hand',
      ribcage: 'Ribcage',
      hip: 'Hip',
      foot: 'Foot',
      other: 'Other'
    };

    return placementMap[placementValue] || 'Arm';
  };

  const resolveDesignImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    if (
      imageUrl.startsWith('data:image') ||
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')
    ) {
      return imageUrl;
    }

    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const serverBase = apiBase.replace(/\/api\/?$/, '');

    if (imageUrl.startsWith('/')) {
      return `${serverBase}${imageUrl}`;
    }

    return `${serverBase}/${imageUrl}`;
  };

  // Mock AI design generation function
  const generateMockDesign = (formData) => {
    const designIdeas = [
      {
        title: `${formData.style.charAt(0).toUpperCase() + formData.style.slice(1)} ${formData.theme} Design`,
        description: `A beautiful ${formData.style} style tattoo featuring ${formData.theme} elements. ${formData.description}`,
        elements: [
          'Central focal point with intricate details',
          formData.mustInclude ? `Must include: ${formData.mustInclude}` : 'Complementary background elements',
          'Flowing lines and balanced composition',
          formData.avoid ? `Avoid: ${formData.avoid}` : 'Symbolic meaning integration'
        ],
        colorPalette: formData.colors || 'Black and grey with accent colors',
        placement: normalizeBodyPlacement(formData.bodyPlacement),
        estimatedTime: '2-4 hours',
        difficulty: 'Medium',
        tips: [
          'Consider placement carefully for best visual impact',
          'Discuss color choices with your artist',
          'Allow for healing time between sessions if large'
        ],
        variations: [
          'Add more intricate shading for depth',
          'Include geometric border elements',
          'Incorporate personal symbols or text'
        ]
      }
    ];

    return designIdeas[0];
  };

  const handleGenerate = async () => {
    if (!validateAll()) {
      return;
    }

    setIsGenerating(true);
    setSavedDesignId(null);
    setPreviewImageFailed(false);
    clearError();

    try {
      // Try to call real API first, fallback to mock
      try {
        const response = await request(() => 
          tattooDesignService.generateAI({
            idea: values.description,
            prompt: values.description,
            style: normalizeStyle(values.style),
            theme: values.theme,
            size: normalizeSize(values.size),
            bodyPlacement: normalizeBodyPlacement(values.bodyPlacement),
            colors: values.colors,
            mood: values.mood,
            mustInclude: values.mustInclude,
            avoid: values.avoid
          })
        );
        
        const apiGeneratedDesign = response?.data?.data?.generatedDesign;
        if (response?.success && apiGeneratedDesign) {
          setPreviewImageFailed(false);
          setGeneratedDesign(apiGeneratedDesign);
        } else {
          throw new Error('No design returned from API');
        }
      } catch (apiError) {
        console.log('API call failed, using mock design generation');
        const mockDesign = generateMockDesign(values);
        setPreviewImageFailed(false);
        setGeneratedDesign(mockDesign);
      }
      
      // Add to history
      setDesignHistory(prev => [{
        id: Date.now(),
        ...values,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 4)]); // Keep last 5 generations
      
    } catch (err) {
      console.error('Design generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGeneratedDesign = async ({ showSuccessAlert = true } = {}) => {
    if (!generatedDesign) return null;
    
    try {
      const designData = {
        title: generatedDesign.title,
        description: generatedDesign.description,
        style: normalizeStyle(values.style),
        size: normalizeSize(values.size),
        bodyPlacements: [normalizeBodyPlacement(values.bodyPlacement)],
        imageUrl: generatedDesign.imageUrl,
        aiGenerated: true,
        prompt: generatedDesign.prompt || values.description,
        parameters: {
          theme: values.theme,
          bodyPlacement: normalizeBodyPlacement(values.bodyPlacement),
          size: values.size,
          colors: values.colors,
          mood: values.mood,
          mustInclude: values.mustInclude,
          avoid: values.avoid
        }
      };
      
      const result = await request(() => tattooDesignService.create(designData));

      if (!result?.success) {
        throw new Error(result?.error?.message || 'Failed to save design. Please try again.');
      }

      const newDesignId = result?.data?.data?.design?._id || null;
      if (newDesignId) {
        setSavedDesignId(newDesignId);
      }

      if (showSuccessAlert) {
        alert('Design saved to your collection!');
      }

      return newDesignId;
    } catch (err) {
      console.error('Save design error:', err);

      if (showSuccessAlert) {
        alert(err.message || 'Failed to save design. Please try again.');
      }

      return null;
    }
  };

  const handleSaveDesign = async () => {
    await saveGeneratedDesign({ showSuccessAlert: true });
  };

  const handleBookWithDesign = async () => {
    if (!generatedDesign) {
      return;
    }

    let designId = savedDesignId;

    if (!designId) {
      designId = await saveGeneratedDesign({ showSuccessAlert: false });
    }

    if (!designId) {
      alert('Please save the design first so your artist can review it during booking.');
      return;
    }

    navigate(`/book?designId=${designId}`);
  };

  const handleLoadFromHistory = (historyItem) => {
    Object.keys(values).forEach(key => {
      if (historyItem[key]) {
        handleChange(key, historyItem[key]);
      }
    });
    setSavedDesignId(null);
    setPreviewImageFailed(false);
    setGeneratedDesign(null);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <section className={`py-16 text-white ${isDark ? 'gradient-bg-hero' : 'bg-gradient-to-r from-purple-600 to-blue-600'}`}>
        <div className="container-max">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Design Generator</h1>
            <p className="text-xl text-white">
              Harness the power of AI to create unique tattoo designs tailored to your vision. 
              Explore endless possibilities and bring your ideas to life.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Design Form */}
            <div className="space-y-8">
              <div className={`card ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Your Design</h2>
                
                {error && (
                  <Alert type="error" onClose={clearError} className="mb-6">
                    {error}
                  </Alert>
                )}
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Select
                      label="Tattoo Style"
                      value={values.style}
                      onChange={(e) => handleChange('style', e.target.value)}
                      onBlur={() => handleBlur('style')}
                      error={touched.style ? errors.style : ''}
                      options={styles}
                      placeholder="Choose style"
                      required
                    />
                    
                    <Select
                      label="Theme"
                      value={values.theme}
                      onChange={(e) => handleChange('theme', e.target.value)}
                      onBlur={() => handleBlur('theme')}
                      error={touched.theme ? errors.theme : ''}
                      options={themes}
                      placeholder="Choose theme"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Select
                      label="Size"
                      value={values.size}
                      onChange={(e) => handleChange('size', e.target.value)}
                      onBlur={() => handleBlur('size')}
                      error={touched.size ? errors.size : ''}
                      options={sizes}
                      placeholder="Choose size"
                      required
                    />

                    <Select
                      label="Body Placement"
                      value={values.bodyPlacement}
                      onChange={(e) => handleChange('bodyPlacement', e.target.value)}
                      onBlur={() => handleBlur('bodyPlacement')}
                      error={touched.bodyPlacement ? errors.bodyPlacement : ''}
                      options={bodyPlacements}
                      placeholder="Choose placement"
                      required
                    />
                  </div>
                  
                  <Textarea
                    label="Design Description"
                    placeholder="Describe your tattoo idea in detail. Include any specific elements, symbols, or concepts you want to incorporate..."
                    value={values.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    onBlur={() => handleBlur('description')}
                    error={touched.description ? errors.description : ''}
                    rows={4}
                    required
                  />
                  
                  <Input
                    label="Color Preferences"
                    placeholder="e.g., Black and grey, Vibrant colors, Specific color palette..."
                    value={values.colors}
                    onChange={(e) => handleChange('colors', e.target.value)}
                  />
                  
                  <Input
                    label="Mood/Feeling"
                    placeholder="e.g., Bold and powerful, Elegant and subtle, Mystical and spiritual..."
                    value={values.mood}
                    onChange={(e) => handleChange('mood', e.target.value)}
                  />

                  <Input
                    label="Must Include Elements"
                    placeholder="e.g., lotus, moon, compass (comma separated)"
                    value={values.mustInclude}
                    onChange={(e) => handleChange('mustInclude', e.target.value)}
                  />

                  <Input
                    label="Elements to Avoid"
                    placeholder="e.g., skulls, text, heavy background (comma separated)"
                    value={values.avoid}
                    onChange={(e) => handleChange('avoid', e.target.value)}
                  />
                  
                  <Button
                    type="button"
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={handleGenerate}
                    loading={isGenerating}
                    disabled={!isValid || isGenerating}
                  >
                    {isGenerating ? 'Generating Design...' : 'Generate AI Design'}
                  </Button>
                </form>
              </div>
              
              {/* Generation History */}
              {designHistory.length > 0 && (
                <div className={`card ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Generations</h3>
                  <div className="space-y-3">
                    {designHistory.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${isDark ? 'bg-dark-850 hover:bg-dark-800' : 'bg-gray-50 hover:bg-gray-100'}`}
                        onClick={() => handleLoadFromHistory(item)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-medium text-sm capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.style} • {item.theme}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Generated Design */}
            <div>
              {isGenerating ? (
                <div className={`card text-center py-16 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
                  <LoadingSpinner size="large" />
                  <h3 className={`text-lg font-semibold mt-4 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Generating Your Design
                  </h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Our AI is crafting a unique design based on your preferences...
                  </p>
                </div>
              ) : generatedDesign ? (
                <div className={`card ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
                  {(() => {
                    const designPreviewUrl = resolveDesignImageUrl(generatedDesign.imageUrl);

                    return (
                      <>
                  <div className="flex justify-between items-start mb-6">
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {generatedDesign.title}
                    </h2>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={handleSaveDesign}
                      loading={loading}
                      disabled={loading || !!savedDesignId}
                    >
                      {savedDesignId ? 'Design Saved' : 'Save Design'}
                    </Button>
                  </div>
                  
                  {/* Design Preview */}
                  {designPreviewUrl && !previewImageFailed ? (
                    <div className="aspect-video bg-gradient-to-br from-accent-100 to-primary-100 rounded-lg mb-6 overflow-hidden border border-accent-200/40">
                      <img
                        src={designPreviewUrl}
                        alt={generatedDesign.title || 'AI generated tattoo design preview'}
                        className="h-full w-full object-contain"
                        onError={() => setPreviewImageFailed(true)}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-accent-100 to-primary-100 rounded-lg mb-6 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-24 h-24 text-accent-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="text-accent-600 font-medium">
                          AI-Generated Design Preview
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Description</h3>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{generatedDesign.description}</p>
                    </div>
                    
                    {/* Design Elements */}
                    <div>
                      <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Key Elements</h3>
                      <ul className="space-y-1">
                        {generatedDesign.elements?.map((element, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className={`mt-1 ${isDark ? 'text-gold-500' : 'text-blue-600'}`}>•</span>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{element}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`rounded-lg p-3 ${isDark ? 'bg-dark-850' : 'bg-gray-50'}`}>
                        <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Color Palette</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{generatedDesign.colorPalette}</p>
                      </div>
                      
                      <div className={`rounded-lg p-3 ${isDark ? 'bg-dark-850' : 'bg-gray-50'}`}>
                        <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Estimated Time</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{generatedDesign.estimatedTime}</p>
                      </div>
                      
                      <div className={`rounded-lg p-3 ${isDark ? 'bg-dark-850' : 'bg-gray-50'}`}>
                        <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Difficulty</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{generatedDesign.difficulty}</p>
                      </div>
                      
                      <div className={`rounded-lg p-3 ${isDark ? 'bg-dark-850' : 'bg-gray-50'}`}>
                        <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Placement</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{generatedDesign.placement}</p>
                      </div>
                    </div>
                    
                    {/* Tips */}
                    <div>
                      <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Artist Tips</h3>
                      <ul className="space-y-1">
                        {generatedDesign.tips?.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className={`mt-1 ${isDark ? 'text-neon-500' : 'text-purple-600'}`}>✓</span>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Variations */}
                    <div>
                      <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Possible Variations</h3>
                      <ul className="space-y-1">
                        {generatedDesign.variations?.map((variation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className={`mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>◆</span>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{variation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Actions */}
                    <div className={`flex flex-col sm:flex-row gap-3 pt-4 ${isDark ? 'border-t border-dark-700' : 'border-t border-gray-200'}`}>
                      <Button
                        variant="primary"
                        onClick={handleBookWithDesign}
                        loading={loading}
                        disabled={loading}
                        className="flex-1"
                      >
                        {savedDesignId ? 'Book With This Design' : 'Save & Book Consultation'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleGenerate}
                        loading={isGenerating}
                        className="flex-1"
                      >
                        Generate New Design
                      </Button>
                    </div>
                  </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className={`card text-center py-16 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
                  <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Ready to Create?
                  </h3>
                  <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Fill out the form to generate your unique AI-powered tattoo design.
                  </p>
                  <div className={`max-w-md mx-auto text-left rounded-lg p-4 ${isDark ? 'bg-gold-500/10 border border-gold-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className="flex items-start space-x-3">
                      <svg className={`w-5 h-5 mt-0.5 ${isDark ? 'text-gold-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className={`text-sm ${isDark ? 'text-gold-200' : 'text-blue-800'}`}>
                        <p className="font-medium mb-1">How it Works</p>
                        <ul className={`space-y-1 ${isDark ? 'text-gold-300' : 'text-blue-700'}`}>
                          <li>• Choose your preferred style and theme</li>
                          <li>• Describe your vision in detail</li>
                          <li>• Get AI-generated design concepts</li>
                          <li>• Refine and book a consultation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIDesignGenerator;
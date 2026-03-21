import React, { useState } from 'react';
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
  const [designHistory, setDesignHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { loading, error, request, clearError } = useApi();

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

  const validationRules = {
    style: [(value) => !value ? 'Please select a style' : ''],
    theme: [(value) => !value ? 'Please select a theme' : ''],
    size: [(value) => !value ? 'Please select a size' : ''],
    description: [
      (value) => !value ? 'Please describe your design idea' : '',
      (value) => value && value.length < 5 ? 'Description must be at least 5 characters' : ''
    ],
    colors: [],
    mood: []
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    resetForm
  } = useForm(
    {
      style: '',
      theme: '',
      size: '',
      description: '',
      colors: '',
      mood: ''
    },
    validationRules
  );

  // Mock AI design generation function
  const generateMockDesign = (formData) => {
    const designIdeas = [
      {
        title: `${formData.style.charAt(0).toUpperCase() + formData.style.slice(1)} ${formData.theme} Design`,
        description: `A beautiful ${formData.style} style tattoo featuring ${formData.theme} elements. ${formData.description}`,
        elements: [
          'Central focal point with intricate details',
          'Complementary background elements',
          'Flowing lines and balanced composition',
          'Symbolic meaning integration'
        ],
        colorPalette: formData.colors || 'Black and grey with accent colors',
        placement: 'Recommended for arm, back, or leg placement',
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
    clearError();

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to call real API first, fallback to mock
      try {
        const response = await request(() => 
          tattooDesignService.generateAI({
            style: values.style,
            theme: values.theme,
            size: values.size,
            description: values.description,
            colors: values.colors,
            mood: values.mood
          })
        );
        
        if (response?.data) {
          setGeneratedDesign(response.data);
        } else {
          throw new Error('No design returned from API');
        }
      } catch (apiError) {
        console.log('API call failed, using mock design generation');
        const mockDesign = generateMockDesign(values);
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

  const handleSaveDesign = async () => {
    if (!generatedDesign) return;
    
    try {
      const designData = {
        title: generatedDesign.title,
        description: generatedDesign.description,
        style: values.style,
        aiGenerated: true,
        prompt: values.description,
        parameters: {
          theme: values.theme,
          size: values.size,
          colors: values.colors,
          mood: values.mood
        }
      };
      
      await request(() => tattooDesignService.create(designData));
      
      // Show success message
      alert('Design saved to your collection!');
    } catch (err) {
      console.error('Save design error:', err);
      
      // Check for duplicate error (409 conflict)
      if (err.response?.status === 409) {
        alert('You have already saved this design to your collection!');
      } else {
        alert(err.response?.data?.message || 'Failed to save design. Please try again.');
      }
    }
  };

  const handleLoadFromHistory = (historyItem) => {
    Object.keys(values).forEach(key => {
      if (historyItem[key]) {
        handleChange(key, historyItem[key]);
      }
    });
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
                  <div className="flex justify-between items-start mb-6">
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {generatedDesign.title}
                    </h2>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={handleSaveDesign}
                      loading={loading}
                    >
                      Save Design
                    </Button>
                  </div>
                  
                  {/* Design Preview */}
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
                        onClick={() => window.open('/book', '_blank')}
                        className="flex-1"
                      >
                        Book Consultation
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
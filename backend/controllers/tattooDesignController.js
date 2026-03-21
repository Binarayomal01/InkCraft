const { TattooDesign } = require('../models');

// @desc    Get all tattoo designs (public gallery)
// @route   GET /api/tattoo-designs
// @access  Public
const getAllDesigns = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      style,
      category,
      size,
      minPrice,
      maxPrice,
      search,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query filter - show all active designs
    const filter = { 
      isActive: true
    };

    if (style) filter.style = style;
    if (category) filter.category = category;
    if (size) filter.size = size;
    if (featured !== undefined) filter.isFeatured = featured === 'true';

    // Price range filter
    if (minPrice || maxPrice) {
      filter.estimatedPrice = {};
      if (minPrice) filter.estimatedPrice.$gte = parseInt(minPrice);
      if (maxPrice) filter.estimatedPrice.$lte = parseInt(maxPrice);
    }

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const designs = await TattooDesign.find(filter)
      .populate('createdBy', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-likes') // Exclude likes array for performance
      .lean(); // Convert to plain JavaScript objects for manipulation

    // Handle images in list view for performance
    // Keep small images, truncate large base64 images
    const designsWithOptimizedImages = designs.map(design => {
      const {additionalImages, ...designWithoutAdditional} = design;
      
      // If image exists and is base64 (large), provide only a flag
      // Frontend should use placeholder icons
      if (design.imageUrl && design.imageUrl.startsWith('data:image') && design.imageUrl.length > 10000) {
        return {
          ...designWithoutAdditional,
          imageUrl: null, // Don't send large base64
          hasImage: true // Flag that image exists
        };
      }
      
      // If image is a URL or small enough, keep it
      return {
        ...designWithoutAdditional,
        hasImage: !!(design.imageUrl && design.imageUrl.length > 0)
      };
    });

    const totalDesigns = await TattooDesign.countDocuments(filter);
    const totalPages = Math.ceil(totalDesigns / limit);

    // Get unique values for filters
    const styleOptions = await TattooDesign.distinct('style', { isActive: true });
    const categoryOptions = await TattooDesign.distinct('category', { isActive: true });
    const sizeOptions = await TattooDesign.distinct('size', { isActive: true });

    console.log(`Returning ${designsWithOptimizedImages.length} designs (images optimized for performance)`);

    res.json({
      success: true,
      data: {
        designs: designsWithOptimizedImages,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalDesigns,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          styles: styleOptions,
          categories: categoryOptions,
          sizes: sizeOptions
        }
      }
    });

  } catch (error) {
    console.error('Get all designs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching designs'
    });
  }
};

// @desc    Get design by ID
// @route   GET /api/tattoo-designs/:id
// @access  Public
const getDesignById = async (req, res) => {
  try {
    const design = await TattooDesign.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }

    // Check if design is active
    if (!design.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Design not available'
      });
    }

    // Increment view count
    design.views += 1;
    await design.save();

    // Return full design including full imageUrl for detail view
    res.json({
      success: true,
      data: design
    });

  } catch (error) {
    console.error('Get design by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching design'
    });
  }
};

// @desc    Generate AI tattoo design (mock/rule-based)
// @route   POST /api/tattoo-designs/ai-generate
// @access  Public
const generateAIDesign = async (req, res) => {
  try {
    const { prompt, style, size, bodyPlacement } = req.body;

    // Validate input
    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Design prompt must be at least 5 characters long'
      });
    }

    // Mock AI generation logic (rule-based)
    const generatedDesign = await generateMockAIDesign(prompt, style, size, bodyPlacement);

    res.json({
      success: true,
      message: 'AI design generated successfully',
      data: {
        generatedDesign,
        suggestions: [
          'Consider adding more details to your design',
          'Think about the placement and size carefully',
          'Our artists can customize this design further',
          'Schedule a consultation to discuss modifications'
        ]
      }
    });

  } catch (error) {
    console.error('Generate AI design error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating design'
    });
  }
};

// Mock AI design generation function (student-friendly)
const generateMockAIDesign = async (prompt, style = 'Traditional', size = 'Medium', bodyPlacement = 'Arm') => {
  const promptLower = prompt.toLowerCase();
  
  // Rule-based generation based on keywords
  let generatedDescription = '';
  let category = 'Other';
  let colors = 'Black & Grey';
  let estimatedTime = 2;
  let estimatedPrice = 200;
  let difficulty = 'Intermediate';
  let tags = [];

  // Animal keywords
  if (/(lion|tiger|wolf|eagle|bird|cat|dog|dragon|snake|butterfly|bee|spider)/.test(promptLower)) {
    category = 'Animals';
    tags.push('animal');
    
    if (/lion/.test(promptLower)) {
      generatedDescription = `A majestic lion design in ${style} style. Features powerful mane details with strong geometric patterns. Perfect for ${bodyPlacement.toLowerCase()} placement, showing strength and courage.`;
      tags.push('strength', 'power', 'majestic');
    } else if (/(wolf|wolves)/.test(promptLower)) {
      generatedDescription = `A fierce wolf design with intricate details in ${style} style. Howling moon silhouette in background. Symbolizes loyalty and independence, ideal for ${bodyPlacement.toLowerCase()}.`;
      tags.push('loyalty', 'wild', 'moon');
    } else if (/(dragon|dragons)/.test(promptLower)) {
      generatedDescription = `An elegant dragon design with flowing curves in ${style} style. Eastern-inspired with cloud elements. Represents wisdom and power, perfectly sized for ${bodyPlacement.toLowerCase()}.`;
      tags.push('wisdom', 'power', 'eastern');
      colors = 'Color';
      estimatedTime = 4;
      estimatedPrice = 400;
      difficulty = 'Advanced';
    } else if (/(butterfly|butterflies)/.test(promptLower)) {
      generatedDescription = `Delicate butterfly design with detailed wing patterns in ${style} style. Gradient shading and fine linework. Perfect feminine touch for ${bodyPlacement.toLowerCase()}.`;
      tags.push('delicate', 'feminine', 'transformation');
      colors = 'Color';
    } else {
      generatedDescription = `Beautiful animal-inspired design in ${style} style, incorporating natural elements and flowing lines. Thoughtfully crafted for ${bodyPlacement.toLowerCase()} placement.`;
      tags.push('nature');
    }
  }
  // Nature keywords
  else if (/(flower|rose|tree|mountain|ocean|sun|moon|star|forest|leaf|vine)/.test(promptLower)) {
    category = 'Nature';
    tags.push('nature');
    
    if (/(rose|roses)/.test(promptLower)) {
      generatedDescription = `Classic rose design with thorny stem in ${style} style. Detailed petals with realistic shading. Timeless symbol of love and beauty for ${bodyPlacement.toLowerCase()}.`;
      tags.push('love', 'beauty', 'classic');
      colors = 'Color';
    } else if (/(tree|trees)/.test(promptLower)) {
      generatedDescription = `Majestic tree design with intricate root system in ${style} style. Represents growth and stability. Branches perfectly frame the ${bodyPlacement.toLowerCase()}.`;
      tags.push('growth', 'stability', 'roots');
    } else if (/(mountain|mountains)/.test(promptLower)) {
      generatedDescription = `Mountain landscape with geometric elements in ${style} style. Clean lines and bold shapes. Adventure and journey theme perfect for ${bodyPlacement.toLowerCase()}.`;
      tags.push('adventure', 'journey', 'geometric');
    } else {
      generatedDescription = `Nature-inspired design combining organic elements in ${style} style. Flowing composition that complements the natural curves of ${bodyPlacement.toLowerCase()}.`;
      tags.push('organic');
    }
  }
  // Geometric/Abstract keywords
  else if (/(geometric|mandala|triangle|circle|pattern|abstract|sacred geometry)/.test(promptLower)) {
    category = 'Geometric';
    tags.push('geometric');
    
    if (/(mandala|mandalas)/.test(promptLower)) {
      generatedDescription = `Intricate mandala design with symmetrical patterns in ${style} style. Sacred geometry with repeating motifs. Centered composition perfect for ${bodyPlacement.toLowerCase()}.`;
      tags.push('sacred', 'symmetrical', 'meditation');
      difficulty = 'Advanced';
      estimatedTime = 5;
      estimatedPrice = 450;
    } else if (/(triangle|triangles)/.test(promptLower)) {
      generatedDescription = `Modern triangle composition in ${style} style. Clean geometric forms with dotwork details. Minimalist approach ideal for ${bodyPlacement.toLowerCase()}.`;
      tags.push('modern', 'minimalist', 'dotwork');
    } else {
      generatedDescription = `Abstract geometric design with flowing patterns in ${style} style. Mathematical precision meets artistic expression for ${bodyPlacement.toLowerCase()}.`;
      tags.push('abstract', 'precision');
    }
  }
  // Text/Quote keywords
  else if (/(quote|text|word|letter|script|writing|name)/.test(promptLower)) {
    category = 'Text/Quotes';
    tags.push('text', 'personal');
    generatedDescription = `Custom lettering design in ${style} style script. Elegant font with decorative elements. Personal meaningful text perfectly sized for ${bodyPlacement.toLowerCase()}.`;
    estimatedTime = 1.5;
    estimatedPrice = 150;
    difficulty = 'Beginner';
  }
  // Symbol keywords
  else if (/(symbol|cross|heart|infinity|anchor|compass|arrow|feather)/.test(promptLower)) {
    category = 'Symbols';
    tags.push('symbol', 'meaning');
    
    if (/(heart|hearts)/.test(promptLower)) {
      generatedDescription = `Stylized heart design with decorative elements in ${style} style. Symbol of love with intricate detailing. Perfectly proportioned for ${bodyPlacement.toLowerCase()}.`;
      tags.push('love', 'emotion');
    } else if (/(compass|compasses)/.test(promptLower)) {
      generatedDescription = `Vintage compass design with navigation elements in ${style} style. Direction and guidance symbolism. Adventure theme ideal for ${bodyPlacement.toLowerCase()}.`;
      tags.push('guidance', 'adventure', 'vintage');
    } else {
      generatedDescription = `Meaningful symbol design in ${style} style with personal significance. Clean execution with thoughtful placement for ${bodyPlacement.toLowerCase()}.`;
    }
  }
  // Default fallback
  else {
    generatedDescription = `Custom design inspired by "${prompt}" in ${style} style. Unique artistic interpretation with personalized elements. Carefully crafted composition for ${bodyPlacement.toLowerCase()} placement.`;
  }

  // Adjust based on size
  if (size === 'Small (2-4 inches)') {
    estimatedTime = Math.max(1, estimatedTime - 1);
    estimatedPrice = Math.max(80, estimatedPrice - 100);
  } else if (size === 'Large (8+ inches)') {
    estimatedTime += 2;
    estimatedPrice += 200;
    difficulty = difficulty === 'Beginner' ? 'Intermediate' : 'Advanced';
  }

  return {
    title: `AI Generated: ${prompt}`,
    description: generatedDescription,
    style,
    category,
    size,
    bodyPlacements: [bodyPlacement],
    colors,
    estimatedTime,
    estimatedPrice,
    difficulty,
    tags,
    imageUrl: '/uploads/designs/ai-generated-placeholder.jpg',
    prompt: prompt,
    isAIGenerated: true
  };
};

// @desc    Like/Unlike a design
// @route   POST /api/tattoo-designs/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const design = await TattooDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }

    await design.toggleLike(req.user.userId);

    res.json({
      success: true,
      message: 'Like toggled successfully',
      data: {
        likeCount: design.likeCount,
        isLiked: design.likes.some(like => like.userId.toString() === req.user.userId.toString())
      }
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling like'
    });
  }
};

// ADMIN CONTROLLER METHODS

// @desc    Create a new design (admin only)
// @route   POST /api/tattoo-designs/admin
// @access  Private (Admin)
const createDesign = async (req, res) => {
  try {
    console.log('=== CREATE DESIGN REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', JSON.stringify(req.user, null, 2));
    
    // Validate user authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required. Please login again.',
        errors: ['createdBy field is required - user must be authenticated']
      });
    }
    
    const designData = {
      ...req.body,
      createdBy: req.user.userId,
      isGalleryDesign: req.body.isGalleryDesign !== undefined ? req.body.isGalleryDesign : true // Admin designs appear in gallery by default
    };

    console.log('Design data to save:', JSON.stringify(designData, null, 2));

    // Create and save the design
    const design = new TattooDesign(designData);
    
    // Validate before saving
    const validationError = design.validateSync();
    if (validationError) {
      console.error('Validation failed before save:', validationError);
      const validationErrors = Object.values(validationError.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    console.log('Validation passed, attempting to save...');
    const savedDesign = await design.save();
    console.log('Save operation completed. Design ID:', savedDesign._id);

    // Verify the design was actually saved to the database
    const verifyDesign = await TattooDesign.findById(savedDesign._id);
    if (!verifyDesign) {
      console.error('CRITICAL: Design saved but could not be retrieved from database!');
      return res.status(500).json({
        success: false,
        message: 'Design created but could not be verified in database'
      });
    }
    console.log('Design verified in database:', verifyDesign._id);

    await savedDesign.populate('createdBy', 'name');

    console.log('Design saved successfully with all data:', savedDesign._id);

    res.status(201).json({
      success: true,
      message: 'Design created successfully',
      data: {
        design: savedDesign
      }
    });

  } catch (error) {
    console.error('Create design error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    if (error.name === 'MongoServerError' || error.name === 'MongoError') {
      console.error('MongoDB error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Database error while creating design',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating design',
      error: error.message
    });
  }
};

// @desc    Update a design (admin only)
// @route   PUT /api/tattoo-designs/admin/:id
// @access  Private (Admin)
const updateDesign = async (req, res) => {
  try {
    const design = await TattooDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }

    // Update design with new data
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'likes') {
        design[key] = req.body[key];
      }
    });

    await design.save();
    await design.populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Design updated successfully',
      data: {
        design
      }
    });

  } catch (error) {
    console.error('Update design error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating design'
    });
  }
};

// @desc    Delete a design (admin only)
// @route   DELETE /api/tattoo-designs/admin/:id
// @access  Private (Admin)
const deleteDesign = async (req, res) => {
  try {
    const design = await TattooDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }

    // Soft delete - mark as inactive
    design.isActive = false;
    await design.save();

    res.json({
      success: true,
      message: 'Design deleted successfully'
    });

  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting design'
    });
  }
};

// @desc    Get user's liked designs
// @route   GET /api/tattoo-designs/user/liked
// @access  Private
const getUserLikedDesigns = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all designs where the user has liked them
    const designs = await TattooDesign.find({
      'likes.userId': userId,
      isActive: true
    })
      .populate('createdBy', 'name')
      .sort({ 'likes.likedAt': -1 })
      .select('-likes'); // Exclude full likes array for performance

    res.json({
      success: true,
      data: designs
    });

  } catch (error) {
    console.error('Get user liked designs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching liked designs'
    });
  }
};

// @desc    Get user's saved/created designs
// @route   GET /api/tattoo-designs/user
// @access  Private
const getUserSavedDesigns = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find all designs created by this user
    const designs = await TattooDesign.find({
      createdBy: userId
    })
      .sort({ createdAt: -1 })
      .select('-likes'); // Exclude full likes array for performance

    res.json({
      success: true,
      data: designs
    });

  } catch (error) {
    console.error('Get user saved designs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saved designs'
    });
  }
};

// @desc    Save a design to user's collection
// @route   POST /api/tattoo-designs/user/save
// @access  Private
const saveUserDesign = async (req, res) => {
  try {
    console.log('=== SAVE USER DESIGN REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', JSON.stringify(req.user, null, 2));

    const {
      title,
      description,
      style,
      category,
      size,
      difficulty,
      estimatedTime,
      estimatedPrice,
      imageUrl,
      colors,
      bodyPlacements,
      tags,
      aiGenerated,
      prompt,
      parameters
    } = req.body;

    // Validate required fields
    if (!title || !description || !style) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and style are required'
      });
    }

    // Check if user already has a design with the same title
    const existingDesign = await TattooDesign.findOne({
      createdBy: req.user.userId,
      title: title.trim()
    });

    if (existingDesign) {
      return res.status(409).json({
        success: false,
        message: 'You have already saved a design with this title',
        data: {
          existingDesignId: existingDesign._id
        }
      });
    }

    // Create design with user as creator and sensible defaults
    const designData = {
      title,
      description,
      style,
      category: category || 'Other',
      size: size || 'Medium (4-8 inches)',
      difficulty: difficulty || 'Intermediate',
      estimatedTime: estimatedTime || 2,
      estimatedPrice: estimatedPrice || 200,
      imageUrl: imageUrl || '/uploads/designs/placeholder.jpg',
      colors: colors || 'Black & Grey',
      bodyPlacements: bodyPlacements || ['Arm'],
      tags: tags || [],
      aiGenerated: aiGenerated || false,
      prompt: prompt || null,
      parameters: parameters || null,
      createdBy: req.user.userId,
      isActive: true,
      isFeatured: false,
      isGalleryDesign: false // User-saved designs don't appear in public gallery
    };

    console.log('Creating design with data:', JSON.stringify(designData, null, 2));

    const newDesign = new TattooDesign(designData);
    const savedDesign = await newDesign.save();

    console.log('Design saved successfully:', savedDesign._id);

    res.status(201).json({
      success: true,
      message: 'Design saved to your collection',
      data: {
        design: savedDesign
      }
    });

  } catch (error) {
    console.error('Save user design error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while saving design',
      error: error.message
    });
  }
};

// @desc    Delete a user's saved design
// @route   DELETE /api/tattoo-designs/user/:id
// @access  Private
const deleteUserDesign = async (req, res) => {
  try {
    const design = await TattooDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }

    // Check if the user owns this design
    if (design.createdBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own designs'
      });
    }

    await TattooDesign.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Design deleted successfully'
    });

  } catch (error) {
    console.error('Delete user design error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting design'
    });
  }
};

module.exports = {
  // Public methods
  getAllDesigns,
  getDesignById,
  generateAIDesign,
  toggleLike,
  
  // User methods
  getUserLikedDesigns,
  getUserSavedDesigns,
  saveUserDesign,
  deleteUserDesign,
  
  // Admin methods
  createDesign,
  updateDesign,
  deleteDesign
};
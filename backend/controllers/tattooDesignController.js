const sharp = require('sharp');
const { TattooDesign } = require('../models');
const { cloudinary } = require('../services/cloudinary');

const AI_STYLE_OPTIONS = [
  'Traditional',
  'Realistic',
  'Watercolor',
  'Minimalist',
  'Geometric',
  'Tribal',
  'Japanese',
  'Blackwork',
  'Neo-Traditional',
  'Abstract',
  'Biomechanical',
  'Portrait',
  'Other'
];

const AI_SIZE_OPTIONS = [
  'Small (2-4 inches)',
  'Medium (4-8 inches)',
  'Large (8+ inches)',
  'Extra Large (12+ inches)'
];

const AI_PLACEMENT_OPTIONS = [
  'Arm',
  'Leg',
  'Back',
  'Chest',
  'Shoulder',
  'Wrist',
  'Ankle',
  'Neck',
  'Hand',
  'Ribcage',
  'Hip',
  'Foot',
  'Other'
];

const AI_CATEGORY_OPTIONS = [
  'Animals',
  'Nature',
  'Symbols',
  'Text/Quotes',
  'Portraits',
  'Abstract',
  'Geometric',
  'Cultural',
  'Religious',
  'Fantasy',
  'Horror',
  'Other'
];

const AI_DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete failed:', error.message);
  }
};

function parseImageDimension(value, fallback) {
  const parsed = parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(1536, Math.max(512, parsed));
}

const AI_IMAGE_PROVIDER = (process.env.AI_IMAGE_PROVIDER || '').trim().toLowerCase() || 'pollinations';
const AI_IMAGE_MODEL = (process.env.AI_IMAGE_MODEL || '').trim() || 'flux';
const AI_IMAGE_WIDTH = parseImageDimension(process.env.AI_IMAGE_WIDTH, 1024);
const AI_IMAGE_HEIGHT = parseImageDimension(process.env.AI_IMAGE_HEIGHT, 1024);
const MAX_INLINE_IMAGE_LENGTH = 10000;
const THUMBNAIL_SIZE = 420;

const STUDIO_BASE_PROMPT = [
  'You are InkCraft Studio\'s senior tattoo concept assistant.',
  'Create design concepts that are artist-feasible, age well on skin, and map cleanly to body placement.',
  'Prioritize clean line hierarchy, realistic session planning, and practical execution.',
  'Avoid offensive, illegal, sexual, hateful, or unsafe content.',
  'Return one production-ready consultation concept in structured form.'
].join(' ');

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const toTitleCase = (value) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const parseListInput = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeString(item))
      .filter(Boolean)
      .slice(0, 8);
  }

  const normalized = normalizeString(value);
  if (!normalized) return [];

  return normalized
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
};

const mapToAllowedValue = (value, allowedValues, fallbackValue) => {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) return fallbackValue;

  const directMatch = allowedValues.find((option) => option.toLowerCase() === normalized);
  if (directMatch) return directMatch;

  const partialMatch = allowedValues.find((option) =>
    option.toLowerCase().includes(normalized) || normalized.includes(option.toLowerCase())
  );

  return partialMatch || fallbackValue;
};

const normalizeStyle = (style) => {
  const styleAliases = {
    realism: 'Realistic',
    realistic: 'Realistic',
    neo: 'Neo-Traditional',
    'neo traditional': 'Neo-Traditional',
    dotwork: 'Blackwork',
    biomech: 'Biomechanical'
  };

  const normalized = normalizeString(style).toLowerCase();
  if (styleAliases[normalized]) {
    return styleAliases[normalized];
  }

  return mapToAllowedValue(style, AI_STYLE_OPTIONS, 'Traditional');
};

const normalizeSize = (size) => {
  const normalized = normalizeString(size).toLowerCase();

  if (normalized.includes('small') || normalized.includes('2-4')) {
    return 'Small (2-4 inches)';
  }
  if (normalized.includes('large') && (normalized.includes('12') || normalized.includes('extra'))) {
    return 'Extra Large (12+ inches)';
  }
  if (normalized.includes('large') || normalized.includes('8+')) {
    return 'Large (8+ inches)';
  }
  if (normalized.includes('medium') || normalized.includes('4-8')) {
    return 'Medium (4-8 inches)';
  }

  return mapToAllowedValue(size, AI_SIZE_OPTIONS, 'Medium (4-8 inches)');
};

const normalizeBodyPlacement = (bodyPlacement) =>
  mapToAllowedValue(bodyPlacement, AI_PLACEMENT_OPTIONS, 'Arm');

const normalizeColors = (colorsInput) => {
  const normalized = normalizeString(colorsInput).toLowerCase();

  if (!normalized) return 'Black & Grey';
  if (normalized.includes('mixed')) return 'Mixed';
  if (normalized.includes('black only')) return 'Black Only';
  if (normalized.includes('color') || normalized.includes('vibrant') || normalized.includes('colour')) {
    return 'Color';
  }
  if (normalized.includes('grey') || normalized.includes('gray')) {
    return 'Black & Grey';
  }
  if (normalized.includes('black')) {
    return 'Black Only';
  }

  return 'Mixed';
};

const inferCategoryFromInput = (input) => {
  const combined = `${input.idea} ${input.theme}`.toLowerCase();

  if (/(lion|wolf|dragon|tiger|bird|snake|butterfly|animal|pet)/.test(combined)) return 'Animals';
  if (/(flower|rose|tree|mountain|ocean|moon|sun|nature|forest|leaf)/.test(combined)) return 'Nature';
  if (/(mandala|geometric|pattern|linework|triangle|circle)/.test(combined)) return 'Geometric';
  if (/(fantasy|myth|mythology|phoenix|magic)/.test(combined)) return 'Fantasy';
  if (/(cross|religious|spiritual|sacred|prayer)/.test(combined)) return 'Religious';
  if (/(quote|word|lettering|script|name|text)/.test(combined)) return 'Text/Quotes';
  if (/(symbol|anchor|compass|infinity|heart)/.test(combined)) return 'Symbols';
  if (/(portrait|face)/.test(combined)) return 'Portraits';
  if (/(abstract|modern)/.test(combined)) return 'Abstract';

  return 'Other';
};

const calculateComplexity = (input) => {
  const baseTimeBySize = {
    'Small (2-4 inches)': 1.5,
    'Medium (4-8 inches)': 3,
    'Large (8+ inches)': 5,
    'Extra Large (12+ inches)': 8
  };

  const basePriceBySize = {
    'Small (2-4 inches)': 160,
    'Medium (4-8 inches)': 280,
    'Large (8+ inches)': 540,
    'Extra Large (12+ inches)': 900
  };

  const wordCount = input.idea.split(/\s+/).filter(Boolean).length;
  const detailScoreFromWords = Math.min(6, Math.max(1, Math.floor(wordCount / 6)));
  const detailScoreFromMustInclude = Math.min(4, input.mustInclude.length);
  const moodBonus = input.mood ? 1 : 0;
  const detailScore = detailScoreFromWords + detailScoreFromMustInclude + moodBonus;

  const estimatedTime = Math.min(
    20,
    Number((baseTimeBySize[input.size] + detailScore * 0.6).toFixed(1))
  );
  const estimatedPrice = Math.min(
    5000,
    Math.round((basePriceBySize[input.size] + detailScore * 85) / 10) * 10
  );

  let difficulty = 'Beginner';
  if (estimatedTime > 2.5) difficulty = 'Intermediate';
  if (estimatedTime > 5) difficulty = 'Advanced';
  if (estimatedTime > 8) difficulty = 'Expert';

  return { estimatedTime, estimatedPrice, difficulty };
};

const buildStudioPrompt = (input) => {
  const mustIncludeText = input.mustInclude.length > 0 ? input.mustInclude.join(', ') : 'None specified';
  const avoidText = input.avoid.length > 0 ? input.avoid.join(', ') : 'None specified';

  return [
    STUDIO_BASE_PROMPT,
    '',
    'Customer brief:',
    `- Main idea: ${input.idea}`,
    `- Style: ${input.style}`,
    `- Theme: ${input.theme || 'Custom'}`,
    `- Placement: ${input.bodyPlacement}`,
    `- Size: ${input.size}`,
    `- Color preference: ${input.colorsInput || 'Not specified'}`,
    `- Mood: ${input.mood || 'Not specified'}`,
    `- Must include: ${mustIncludeText}`,
    `- Avoid: ${avoidText}`,
    input.additionalDetails ? `- Extra notes: ${input.additionalDetails}` : '- Extra notes: None',
    '',
    'Output rules:',
    '- Return practical, tattooable concept details.',
    '- Keep design readable after healing.',
    '- Include artist feasibility notes for consultation.',
    '- Return JSON with keys: title, description, category, colors, estimatedTime, estimatedPrice, difficulty, tags, elements, tips, variations, artistFeasibility, artistNotes.'
  ].join('\n');
};

const buildSuggestionList = (input) => {
  const suggestions = [
    'Bring 2-3 visual references to your consultation so the artist can fine tune composition.',
    'Ask for a stencil preview on the chosen body area before final approval.',
    'Discuss line thickness and shading depth for better long-term aging.'
  ];

  if (input.mustInclude.length > 0) {
    suggestions.push('Prioritize your must-include elements from most important to optional.');
  }

  if (input.avoid.length > 0) {
    suggestions.push('Show your avoid list to the artist so they can adjust the concept early.');
  }

  return suggestions.slice(0, 4);
};

const slugifyTag = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 24);

const getPromptSeed = (input) => {
  const source = `${input.idea}|${input.style}|${input.size}|${input.bodyPlacement}|${Date.now()}`;
  let hash = 0;

  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash % 1000000);
};

const buildArtworkPrompt = (input) => {
  const mustIncludeText = input.mustInclude.length > 0 ? input.mustInclude.join(', ') : 'none';
  const avoidText = input.avoid.length > 0 ? input.avoid.join(', ') : 'none';

  return [
    'professional tattoo flash artwork',
    `${input.style.toLowerCase()} style`,
    `${input.bodyPlacement.toLowerCase()} placement composition`,
    `main subject: ${input.idea}`,
    `theme: ${input.theme || 'custom'}`,
    `must include: ${mustIncludeText}`,
    `avoid: ${avoidText}`,
    `color direction: ${input.colorsInput || 'black and grey'}`,
    `mood: ${input.mood || 'balanced and bold'}`,
    'high detail linework, tattoo stencil quality, skin-safe contrast, clean silhouette',
    'no text, no logo, no watermark, no UI elements'
  ].join(', ');
};

const generateArtworkImageUrl = async (input) => {
  if (AI_IMAGE_PROVIDER !== 'pollinations') {
    throw new Error(`Unsupported AI_IMAGE_PROVIDER: ${AI_IMAGE_PROVIDER}`);
  }

  const prompt = buildArtworkPrompt(input);
  const negativePrompt = [
    'text',
    'letters',
    'watermark',
    'logo',
    'ui',
    'concept card',
    'dashboard',
    'blurry',
    'deformed'
  ].join(', ');

  const seed = getPromptSeed(input);
  const promptPath = encodeURIComponent(prompt);
  const imageUrl = new URL(`https://image.pollinations.ai/prompt/${promptPath}`);
  imageUrl.searchParams.set('model', AI_IMAGE_MODEL);
  imageUrl.searchParams.set('width', String(AI_IMAGE_WIDTH));
  imageUrl.searchParams.set('height', String(AI_IMAGE_HEIGHT));
  imageUrl.searchParams.set('seed', String(seed));
  imageUrl.searchParams.set('nologo', 'true');
  imageUrl.searchParams.set('negative', negativePrompt);

  return imageUrl.toString();
};

const fetchArtworkAsDataUri = async (imageUrl) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(imageUrl, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Image provider returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const imageBase64 = imageBuffer.toString('base64');

    return `data:${contentType};base64,${imageBase64}`;
  } finally {
    clearTimeout(timeoutId);
  }
};

const generateStructuredMockAIDesign = async (input, compiledPrompt) => {
  const category = inferCategoryFromInput(input);
  const { estimatedTime, estimatedPrice, difficulty } = calculateComplexity(input);
  const themeLabel = toTitleCase(input.theme || category);

  const elements = [
    `${input.style} composition aligned to ${input.bodyPlacement.toLowerCase()} flow`,
    `Primary narrative based on: ${input.idea}`,
    input.mustInclude.length > 0
      ? `Must-have motifs: ${input.mustInclude.join(', ')}`
      : 'Balanced focal point with supporting detail hierarchy',
    input.avoid.length > 0
      ? `Avoid motifs: ${input.avoid.join(', ')}`
      : 'Avoid overcrowding to preserve readability over time'
  ];

  const tips = [
    'Confirm stencil scale on skin before linework begins.',
    'Use strong primary outlines in high-motion body areas.',
    'Plan shading density to keep contrast clear after healing.'
  ];

  if (input.size === 'Large (8+ inches)' || input.size === 'Extra Large (12+ inches)') {
    tips.push('Split into multiple sessions to protect skin quality and detail retention.');
  }

  const variations = [
    `Create a high-contrast ${input.colors === 'Color' ? 'black-and-grey' : 'color-accent'} variant for versatility.`,
    'Offer a minimal-line version focused on silhouette and core symbolism.',
    'Add optional background texture only if it does not compete with the focal motif.'
  ];

  const tagCandidates = [
    input.style,
    themeLabel,
    input.bodyPlacement,
    category,
    ...input.mustInclude
  ];

  const tags = [...new Set(tagCandidates.map(slugifyTag).filter(Boolean))].slice(0, 10);

  const ideaSentence = input.idea.endsWith('.') ? input.idea : `${input.idea}.`;
  const moodSentence = input.mood ? `The overall emotional tone should feel ${input.mood}.` : '';
  const colorSentence = input.colorsInput
    ? `Preferred color direction: ${input.colorsInput}.`
    : 'Use a timeless black-and-grey priority unless artist recommends accents.';
  const includeSentence = input.mustInclude.length > 0
    ? `Must include elements: ${input.mustInclude.join(', ')}.`
    : '';
  const avoidSentence = input.avoid.length > 0
    ? `Avoid these elements: ${input.avoid.join(', ')}.`
    : '';

  const description = [
    `A ${input.style.toLowerCase()} ${themeLabel.toLowerCase()} tattoo artwork designed for ${input.bodyPlacement.toLowerCase()} placement.`,
    ideaSentence,
    moodSentence,
    colorSentence,
    includeSentence,
    avoidSentence
  ]
    .filter(Boolean)
    .join(' ');

  const artistFeasibility =
    estimatedTime <= 3
      ? 'High feasibility for a single session with normal skin prep.'
      : estimatedTime <= 6
        ? 'Moderate feasibility; confirm detail density and break plan before session.'
        : 'Complex concept; likely requires multiple sessions and staged detailing.';

  const artistNotes = input.additionalDetails
    ? `Customer extra notes: ${input.additionalDetails}`
    : 'Review line hierarchy, placement fit, and long-term readability during consultation.';

  const artworkImageUrl = await generateArtworkImageUrl(input);
  let resolvedImageUrl = artworkImageUrl;

  try {
    resolvedImageUrl = await fetchArtworkAsDataUri(artworkImageUrl);
  } catch (imageError) {
    console.warn('Falling back to external artwork URL:', imageError.message);
  }

  return {
    title: `AI ${input.style} ${themeLabel} Artwork`,
    description,
    style: input.style,
    category: AI_CATEGORY_OPTIONS.includes(category) ? category : 'Other',
    size: input.size,
    bodyPlacements: [input.bodyPlacement],
    colors: input.colors,
    colorPalette: input.colors,
    placement: input.bodyPlacement,
    estimatedTime,
    estimatedPrice,
    difficulty: AI_DIFFICULTY_OPTIONS.includes(difficulty) ? difficulty : 'Intermediate',
    tags,
    elements,
    tips,
    variations,
    artistFeasibility,
    artistNotes,
    imageUrl: resolvedImageUrl,
    prompt: compiledPrompt,
    aiGenerated: true
  };
};

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
      includeImages = 'false',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query filter - show only explicitly public gallery designs
    const filter = { 
      isActive: true,
      isGalleryDesign: true
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
    const includeFullImages = includeImages === 'true';
    const designsWithOptimizedImages = await Promise.all(
      designs.map((design) => optimizeDesignListItem(design, includeFullImages))
    );

    const totalDesigns = await TattooDesign.countDocuments(filter);
    const totalPages = Math.ceil(totalDesigns / limit);

    // Get unique values for filters
    const publicFilter = { isActive: true, isGalleryDesign: true };
    const styleOptions = await TattooDesign.distinct('style', publicFilter);
    const categoryOptions = await TattooDesign.distinct('category', publicFilter);
    const sizeOptions = await TattooDesign.distinct('size', publicFilter);

    console.log(
      `Returning ${designsWithOptimizedImages.length} designs ` +
      (includeFullImages ? '(full images included)' : '(images optimized for performance)')
    );

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

// @desc    Get all tattoo designs for admin management
// @route   GET /api/tattoo-designs/admin
// @access  Private (Admin)
const getAllDesignsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      style,
      category,
      size,
      minPrice,
      maxPrice,
      search,
      featured,
      includePrivate = 'false',
      includeInactive = 'false',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    // Admin design management shows public portfolio designs by default.
    // Private user-saved designs can be included explicitly with includePrivate=true.
    if (includePrivate !== 'true') {
      filter.isGalleryDesign = true;
    }

    if (style) filter.style = style;
    if (category) filter.category = category;
    if (size) filter.size = size;
    if (featured !== undefined) filter.isFeatured = featured === 'true';

    if (minPrice || maxPrice) {
      filter.estimatedPrice = {};
      if (minPrice) filter.estimatedPrice.$gte = parseInt(minPrice, 10);
      if (maxPrice) filter.estimatedPrice.$lte = parseInt(maxPrice, 10);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const designs = await TattooDesign.find(filter)
      .populate('createdBy', 'name email role')
      .sort(sortObj)
      .skip(skip)
      .limit(parsedLimit)
      .select('-likes')
      .lean();

    const designsWithOptimizedImages = await Promise.all(
      designs.map((design) => optimizeDesignListItem(design, false))
    );

    const totalDesigns = await TattooDesign.countDocuments(filter);
    const totalPages = Math.ceil(totalDesigns / parsedLimit);

    const optionFilter = {};
    if (includeInactive !== 'true') {
      optionFilter.isActive = true;
    }
    if (includePrivate !== 'true') {
      optionFilter.isGalleryDesign = true;
    }
    const styleOptions = await TattooDesign.distinct('style', optionFilter);
    const categoryOptions = await TattooDesign.distinct('category', optionFilter);
    const sizeOptions = await TattooDesign.distinct('size', optionFilter);

    res.json({
      success: true,
      data: {
        designs: designsWithOptimizedImages,
        pagination: {
          currentPage: parsedPage,
          totalPages,
          totalDesigns,
          hasNext: parsedPage < totalPages,
          hasPrev: parsedPage > 1
        },
        filters: {
          styles: styleOptions,
          categories: categoryOptions,
          sizes: sizeOptions
        }
      }
    });

  } catch (error) {
    console.error('Get admin designs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin designs'
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

    // Private designs are only accessible to owner/admin.
    if (!design.isGalleryDesign) {
      const requesterId = req.user?.userId;
      const ownerId = design.createdBy?._id ? design.createdBy._id.toString() : design.createdBy?.toString();
      const isOwner = Boolean(requesterId && ownerId && requesterId.toString() === ownerId);
      const isAdmin = req.user?.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Design not found'
        });
      }
    }

    if (!design.aiGenerated && design.prompt) {
      design.aiGenerated = true;
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

// @desc    Generate AI tattoo design (structured prompt pipeline)
// @route   POST /api/tattoo-designs/ai-generate
// @access  Public
const generateAIDesign = async (req, res) => {
  try {
    const prompt = normalizeString(req.body.prompt || req.body.idea || req.body.description);
    const style = normalizeStyle(req.body.style);
    const size = normalizeSize(req.body.size);
    const bodyPlacement = normalizeBodyPlacement(req.body.bodyPlacement);
    const theme = normalizeString(req.body.theme);
    const colorsInput = normalizeString(req.body.colors);
    const mood = normalizeString(req.body.mood);
    const mustInclude = parseListInput(req.body.mustInclude || req.body.mustHaveElements);
    const avoid = parseListInput(req.body.avoid || req.body.avoidElements);
    const additionalDetails = normalizeString(req.body.additionalDetails || req.body.notes);

    // Validate input
    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Design prompt must be at least 5 characters long'
      });
    }

    const generationInput = {
      idea: prompt,
      style,
      size,
      bodyPlacement,
      theme,
      colorsInput,
      colors: normalizeColors(colorsInput),
      mood,
      mustInclude,
      avoid,
      additionalDetails
    };

    const compiledPrompt = buildStudioPrompt(generationInput);

    // Structured mock generation logic
    const generatedDesign = await generateStructuredMockAIDesign(generationInput, compiledPrompt);

    res.json({
      success: true,
      message: 'AI design generated successfully',
      data: {
        generatedDesign,
        suggestions: buildSuggestionList(generationInput),
        promptSummary: {
          style,
          size,
          bodyPlacement,
          theme: theme || 'Custom',
          hasMustInclude: mustInclude.length > 0,
          hasAvoidList: avoid.length > 0
        }
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

    // Private designs cannot be liked by non-owners/non-admins.
    if (!design.isGalleryDesign) {
      const ownerId = design.createdBy ? design.createdBy.toString() : null;
      const isOwner = Boolean(ownerId && ownerId === req.user.userId.toString());
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You cannot like a private design'
        });
      }
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
    
    const { imagePublicId: ignoredImagePublicId, ...bodyData } = req.body;
    const imageUrlFromUpload = req.file ? req.file.path : null;
    const imagePublicIdFromUpload = req.file ? req.file.filename : null;
    const normalizedTags = bodyData.tags ? parseListInput(bodyData.tags) : [];
    const normalizedBodyPlacements = bodyData.bodyPlacements ? parseListInput(bodyData.bodyPlacements) : [];

    const designData = {
      ...bodyData,
      createdBy: req.user.userId,
      isGalleryDesign: req.body.isGalleryDesign !== undefined ? req.body.isGalleryDesign : true, // Admin designs appear in gallery by default
      ...(normalizedTags.length ? { tags: normalizedTags } : {}),
      ...(normalizedBodyPlacements.length ? { bodyPlacements: normalizedBodyPlacements } : {}),
      ...(imageUrlFromUpload
        ? {
            imageUrl: imageUrlFromUpload,
            imagePublicId: imagePublicIdFromUpload
          }
        : {})
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

    const hasNewImage = Boolean(req.file);

    if (hasNewImage) {
      await deleteCloudinaryAsset(design.imagePublicId);
      design.imageUrl = req.file.path;
      design.imagePublicId = req.file.filename;
    }

    // Update design with new data
    Object.keys(req.body).forEach(key => {
      const blockedKeys = ['_id', 'createdBy', 'likes', 'imagePublicId'];
      if (blockedKeys.includes(key)) {
        return;
      }

      if (hasNewImage && key === 'imageUrl') {
        return;
      }

      if (key === 'tags') {
        design.tags = parseListInput(req.body.tags);
        return;
      }

      if (key === 'bodyPlacements') {
        design.bodyPlacements = parseListInput(req.body.bodyPlacements);
        return;
      }

      design[key] = req.body[key];
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

// @desc    Get pending gallery submissions (admin only)
// @route   GET /api/tattoo-designs/admin/gallery-submissions
// @access  Private (Admin)
const getGallerySubmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      status = 'pending',
      sortBy = 'gallerySubmittedAt',
      sortOrder = 'desc'
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(200, parseInt(limit, 10) || 25));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {
      isActive: true,
      isGalleryDesign: false
    };

    if (status === 'approved' || status === 'all') {
      delete filter.isGalleryDesign;
    }

    if (status && status !== 'all') {
      filter.gallerySubmissionStatus = status;
    } else {
      filter.gallerySubmissionStatus = { $in: ['pending', 'approved', 'rejected'] };
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const designs = await TattooDesign.find(filter)
      .populate('createdBy', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parsedLimit)
      .select('-likes')
      .lean();

    const designsWithOptimizedImages = await Promise.all(
      designs.map((design) => optimizeDesignListItem(design, false))
    );

    const totalDesigns = await TattooDesign.countDocuments(filter);
    const totalPages = Math.ceil(totalDesigns / parsedLimit);

    res.json({
      success: true,
      data: {
        designs: designsWithOptimizedImages,
        pagination: {
          currentPage: parsedPage,
          totalPages,
          totalDesigns,
          hasNext: parsedPage < totalPages,
          hasPrev: parsedPage > 1
        }
      }
    });
  } catch (error) {
    console.error('Get gallery submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery submissions'
    });
  }
};

// @desc    Approve or reject a gallery submission (admin only)
// @route   PUT /api/tattoo-designs/admin/:id/gallery-approval
// @access  Private (Admin)
const reviewGallerySubmission = async (req, res) => {
  try {
    const { decision } = req.body;
    const normalizedDecision = typeof decision === 'string' ? decision.trim().toLowerCase() : '';

    if (!['approved', 'rejected'].includes(normalizedDecision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be approved or rejected'
      });
    }

    const design = await TattooDesign.findById(req.params.id).populate('createdBy', 'name email');

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }

    if (design.gallerySubmissionStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Design is not pending gallery approval'
      });
    }

    design.gallerySubmissionStatus = normalizedDecision;
    design.galleryReviewedAt = new Date();
    design.isGalleryDesign = normalizedDecision === 'approved';

    if (normalizedDecision === 'approved' && !design.aiGenerated && design.prompt) {
      design.aiGenerated = true;
    }

    await design.save();

    res.json({
      success: true,
      message: `Gallery submission ${normalizedDecision}`,
      data: {
        design
      }
    });
  } catch (error) {
    console.error('Review gallery submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reviewing gallery submission'
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
  getAllDesignsAdmin,
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
  deleteDesign,
  getGallerySubmissions,
  reviewGallerySubmission
};

const buildThumbnailDataUri = async (imageUrl) => {
  const match = /^data:(.+?);base64,(.+)$/.exec(imageUrl || '');

  if (!match) {
    return null;
  }

  const buffer = Buffer.from(match[2], 'base64');
  const thumbnailBuffer = await sharp(buffer)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover' })
    .jpeg({ quality: 72 })
    .toBuffer();

  return `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
};

const optimizeDesignListItem = async (design, includeFullImages) => {
  const { additionalImages, ...designWithoutAdditional } = design;
  const hasImage = Boolean(design.imageUrl && design.imageUrl.length > 0);
  const aiGenerated = Boolean(design.aiGenerated || design.prompt);

  if (hasImage && design.imageUrl.startsWith('data:image') && design.imageUrl.length > MAX_INLINE_IMAGE_LENGTH) {
    let thumbnailUrl = null;

    try {
      thumbnailUrl = await buildThumbnailDataUri(design.imageUrl);
    } catch (error) {
      console.warn('Thumbnail generation failed:', error.message);
    }

    if (!includeFullImages) {
      return {
        ...designWithoutAdditional,
        imageUrl: null,
        hasImage: true,
        thumbnailUrl,
        aiGenerated
      };
    }

    return {
      ...designWithoutAdditional,
      hasImage,
      thumbnailUrl,
      aiGenerated
    };
  }

  return {
    ...designWithoutAdditional,
    hasImage,
    thumbnailUrl: null,
    aiGenerated
  };
};
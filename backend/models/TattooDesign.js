const mongoose = require('mongoose');

const tattooDesignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Design title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Design description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  style: {
    type: String,
    required: [true, 'Tattoo style is required'],
    enum: [
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
    ]
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
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
    ]
  },
  size: {
    type: String,
    required: [true, 'Size specification is required'],
    enum: ['Small (2-4 inches)', 'Medium (4-8 inches)', 'Large (8+ inches)', 'Extra Large (12+ inches)']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  estimatedTime: {
    type: Number, // in hours
    required: [true, 'Estimated time is required'],
    min: [0.5, 'Estimated time must be at least 0.5 hours'],
    max: [20, 'Estimated time cannot exceed 20 hours']
  },
  estimatedPrice: {
    type: Number,
    required: [true, 'Estimated price is required'],
    min: [50, 'Estimated price must be at least $50'],
    max: [5000, 'Estimated price cannot exceed $5000']
  },
  imageUrl: {
    type: String,
    default: '/uploads/designs/placeholder.jpg'
  },
  imagePublicId: {
    type: String,
    default: null
  },
  additionalImages: [{
    url: String,
    caption: String
  }],
  colors: {
    type: String,
    enum: ['Black & Grey', 'Color', 'Black Only', 'Mixed'],
    default: 'Black & Grey',
    required: false
  },
  bodyPlacements: {
    type: [{
      type: String,
      enum: [
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
      ]
    }],
    default: ['Arm']
  },
  tags: [String],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  prompt: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isGalleryDesign: {
    type: Boolean,
    default: false // Only featured public designs appear in gallery
  },
  gallerySubmissionStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  gallerySubmittedAt: {
    type: Date,
    default: null
  },
  galleryReviewedAt: {
    type: Date,
    default: null
  },
  artist: {
    type: String,
    default: 'InkCraft Studio'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
tattooDesignSchema.index({ style: 1, category: 1 });
tattooDesignSchema.index({ isActive: 1, isFeatured: -1 });
tattooDesignSchema.index({ estimatedPrice: 1 });
tattooDesignSchema.index({ tags: 1 });
tattooDesignSchema.index({ createdAt: -1 });

// Virtual for like count
tattooDesignSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for formatted price
tattooDesignSchema.virtual('formattedPrice').get(function() {
  return `$${this.estimatedPrice}`;
});

// Method to increment views
tattooDesignSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
tattooDesignSchema.methods.toggleLike = function(userId) {
  const existingLikeIndex = this.likes.findIndex(
    like => like.userId.toString() === userId.toString()
  );
  
  if (existingLikeIndex > -1) {
    // Remove like
    this.likes.splice(existingLikeIndex, 1);
  } else {
    // Add like
    this.likes.push({ userId });
  }
  
  return this.save();
};

// Ensure virtual fields are serialized
tattooDesignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TattooDesign', tattooDesignSchema);
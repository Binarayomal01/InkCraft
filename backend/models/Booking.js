const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  tattooIdea: {
    type: String,
    required: [true, 'Tattoo idea/description is required'],
    trim: true,
    minlength: [10, 'Tattoo description must be at least 10 characters long'],
    maxlength: [1000, 'Tattoo description cannot exceed 1000 characters']
  },
  tattooStyle: {
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
      'Other'
    ]
  },
  bodyPlacement: {
    type: String,
    required: [true, 'Body placement is required'],
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
      'Other'
    ]
  },
  size: {
    type: String,
    required: [true, 'Tattoo size is required'],
    enum: ['Small (2-4 inches)', 'Medium (4-8 inches)', 'Large (8+ inches)', 'Full Sleeve/Back']
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required'],
    validate: {
      validator: function(date) {
        // Only enforce future-date constraint when creating a booking
        // or when the preferred date itself is being edited.
        if (!this.isNew && !this.isModified('preferredDate')) {
          return true;
        }
        return date > new Date();
      },
      message: 'Preferred date must be in the future'
    }
  },
  preferredTime: {
    type: String,
    required: [true, 'Preferred time is required'],
    enum: [
      '9:00 AM - 12:00 PM',
      '12:00 PM - 3:00 PM', 
      '3:00 PM - 6:00 PM',
      '6:00 PM - 9:00 PM'
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  tattooDesignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TattooDesign'
  },
  gallerySubmissionRequested: {
    type: Boolean,
    default: false
  },
  estimatedDuration: {
    type: Number, // in hours
    min: 1,
    max: 12
  },
  estimatedPrice: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
    trim: true
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    trim: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ preferredDate: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ tattooDesignId: 1 });
// Compound index to efficiently check for double bookings
bookingSchema.index({ preferredDate: 1, preferredTime: 1, status: 1 });

// Virtual for formatted date
bookingSchema.virtual('formattedPreferredDate').get(function() {
  return this.preferredDate ? this.preferredDate.toLocaleDateString() : null;
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
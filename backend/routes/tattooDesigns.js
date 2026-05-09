const express = require('express');
const { tattooDesignController } = require('../controllers');
const { authenticateToken, optionalAuth, requireAdmin, generalRateLimit, asyncHandler } = require('../middleware');

const router = express.Router();

// PUBLIC ROUTES

// @desc    Get all tattoo designs (public gallery)
// @route   GET /api/tattoo-designs
// @access  Public
router.get('/', asyncHandler(tattooDesignController.getAllDesigns));

// @desc    Generate AI tattoo design (mock/rule-based)
// @route   POST /api/tattoo-designs/ai-generate
// @access  Public
router.post('/ai-generate', generalRateLimit, asyncHandler(tattooDesignController.generateAIDesign));

// USER ROUTES

// @desc    Save a design to user's collection
// @route   POST /api/tattoo-designs/user/save
// @access  Private
router.post('/user/save', authenticateToken, generalRateLimit, asyncHandler(tattooDesignController.saveUserDesign));

// @desc    Get user's saved/created designs
// @route   GET /api/tattoo-designs/user
// @access  Private
router.get('/user', authenticateToken, asyncHandler(tattooDesignController.getUserSavedDesigns));

// @desc    Get user's liked designs
// @route   GET /api/tattoo-designs/user/liked
// @access  Private
router.get('/user/liked', authenticateToken, asyncHandler(tattooDesignController.getUserLikedDesigns));

// @desc    Delete a user's saved design
// @route   DELETE /api/tattoo-designs/user/:id
// @access  Private
router.delete('/user/:id', authenticateToken, asyncHandler(tattooDesignController.deleteUserDesign));

// ADMIN ROUTES

// @desc    Get all designs for admin management
// @route   GET /api/tattoo-designs/admin
// @access  Private (Admin)
router.get('/admin', authenticateToken, requireAdmin, asyncHandler(tattooDesignController.getAllDesignsAdmin));

// @desc    Get gallery submission queue
// @route   GET /api/tattoo-designs/admin/gallery-submissions
// @access  Private (Admin)
router.get('/admin/gallery-submissions', authenticateToken, requireAdmin, asyncHandler(tattooDesignController.getGallerySubmissions));

// @desc    Get design by ID
// @route   GET /api/tattoo-designs/:id
// @access  Public (private designs require owner/admin)
router.get('/:id', optionalAuth, asyncHandler(tattooDesignController.getDesignById));

// USER ROUTES (Optional Auth - works for both authenticated and anonymous users)

// @desc    Like/Unlike a design
// @route   POST /api/tattoo-designs/:id/like
// @access  Private
router.post('/:id/like', authenticateToken, generalRateLimit, asyncHandler(tattooDesignController.toggleLike));

// @desc    Create a new design (admin only)
// @route   POST /api/tattoo-designs/admin
// @access  Private (Admin)
router.post('/admin', authenticateToken, requireAdmin, generalRateLimit, asyncHandler(tattooDesignController.createDesign));

// @desc    Test database connection and save operation
// @route   POST /api/tattoo-designs/admin/test
// @access  Private (Admin)
router.post('/admin/test', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { TattooDesign } = require('../models');
    
    // Create a test design with minimum required fields
    const testDesign = new TattooDesign({
      title: `Test Design ${Date.now()}`,
      description: 'This is a test design to verify database connection',
      style: 'Traditional',
      category: 'Other',
      size: 'Small (2-4 inches)',
      difficulty: 'Beginner',
      estimatedTime: 1,
      estimatedPrice: 100,
      createdBy: req.user.userId,
      tags: ['test']
    });
    
    console.log('Attempting to save test design...');
    const saved = await testDesign.save();
    console.log('Test design saved successfully:', saved._id);
    
    // Verify it's in the database
    const found = await TattooDesign.findById(saved._id);
    console.log('Test design found in database:', found ? 'YES' : 'NO');
    
    // Clean up - delete the test design
    await TattooDesign.findByIdAndDelete(saved._id);
    console.log('Test design cleaned up');
    
    res.json({
      success: true,
      message: 'Database test passed! Design was saved and retrieved successfully.',
      testResult: {
        saved: true,
        found: !!found,
        designId: saved._id
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
}));

// @desc    Update a design (admin only)
// @route   PUT /api/tattoo-designs/admin/:id
// @access  Private (Admin)
router.put('/admin/:id', authenticateToken, requireAdmin, generalRateLimit, asyncHandler(tattooDesignController.updateDesign));

// @desc    Approve or reject gallery submission
// @route   PUT /api/tattoo-designs/admin/:id/gallery-approval
// @access  Private (Admin)
router.put('/admin/:id/gallery-approval', authenticateToken, requireAdmin, generalRateLimit, asyncHandler(tattooDesignController.reviewGallerySubmission));

// @desc    Delete a design (admin only)
// @route   DELETE /api/tattoo-designs/admin/:id
// @access  Private (Admin)
router.delete('/admin/:id', authenticateToken, requireAdmin, asyncHandler(tattooDesignController.deleteDesign));

module.exports = router;
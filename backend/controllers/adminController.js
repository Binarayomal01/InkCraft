const { User, Booking, TattooDesign } = require('../models');

/**
 * Get comprehensive dashboard statistics
 * Includes user count, booking count, design count, and recent activity
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get time filter from query (default to week)
    const timeFilter = req.query.timeFilter || 'week';
    
    // Calculate date threshold based on filter
    const now = new Date();
    let dateThreshold = new Date();
    
    switch (timeFilter) {
      case 'week':
        dateThreshold.setDate(now.getDate() - 7);
        break;
      case 'month':
        dateThreshold.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        dateThreshold.setMonth(now.getMonth() - 3);
        break;
      default:
        dateThreshold.setDate(now.getDate() - 7);
    }

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalDesigns = await TattooDesign.countDocuments();
    
    // Get pending bookings count
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    
    // Get recent bookings (last 5)
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .select('userId customerName tattooStyle preferredDate status createdAt estimatedPrice')
      .lean();
    
    // Format recent bookings
    const formattedRecentBookings = recentBookings.map(booking => ({
      _id: booking._id,
      customerName: booking.customerName || booking.userId?.name || 'N/A',
      tattooStyle: booking.tattooStyle,
      preferredDate: booking.preferredDate,
      status: booking.status,
      createdAt: booking.createdAt,
      estimatedPrice: booking.estimatedPrice
    }));
    
    // Get recent users (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt role')
      .lean();
    
    // Calculate revenue (sum of completed bookings with estimated price)
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          estimatedPrice: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$estimatedPrice' }
        }
      }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get stats for the selected time period
    const periodUsers = await User.countDocuments({ 
      createdAt: { $gte: dateThreshold } 
    });
    
    const periodBookings = await Booking.countDocuments({ 
      createdAt: { $gte: dateThreshold } 
    });
    
    const periodDesigns = await TattooDesign.countDocuments({ 
      createdAt: { $gte: dateThreshold } 
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        pendingBookings,
        totalDesigns,
        totalRevenue,
        recentBookings: formattedRecentBookings,
        recentUsers,
        period: {
          filter: timeFilter,
          users: periodUsers,
          bookings: periodBookings,
          designs: periodDesigns
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

/**
 * Get user by ID (admin only)
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

/**
 * Update user (admin only)
 */
const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

/**
 * Delete user (admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }
    
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};

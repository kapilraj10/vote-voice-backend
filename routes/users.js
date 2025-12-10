const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message,
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message,
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        activeVoters: verifiedUsers, // Simplified
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error.message,
    });
  }
});

module.exports = router;

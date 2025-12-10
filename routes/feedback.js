const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { validateFeedback } = require('../middleware/validation');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Public
router.post('/', validateFeedback, async (req, res) => {
  try {
    const { name, email, category, rating, message } = req.body;

    console.log('📥 Feedback submission received:', {
      name: name || 'Anonymous',
      email: email || 'N/A',
      category,
      rating,
      messageLength: message?.length
    });

    const feedback = new Feedback({
      name,
      email,
      category,
      rating,
      message,
    });

    await feedback.save();
    console.log('✅ Feedback saved successfully:', feedback._id);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        category: feedback.category,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error saving feedback:', error.message);
    res.status(500).json({
      error: 'Failed to submit feedback',
      message: error.message,
    });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback (Admin only)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, category } = req.query;
    
    console.log('📋 Fetching feedbacks with filters:', { status, category });
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    console.log(`✅ Found ${feedbacks.length} feedbacks`);

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    console.error('❌ Error fetching feedback:', error.message);
    res.status(500).json({
      error: 'Failed to fetch feedback',
      message: error.message,
    });
  }
});

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const byCategory = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const avgRating = await Feedback.aggregate([
      {
        $match: { rating: { $exists: true } },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        total,
        byCategory,
        averageRating: avgRating[0]?.averageRating || 0,
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

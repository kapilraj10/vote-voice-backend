const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const { auth, adminAuth } = require('../middleware/auth');
const { validateCandidate } = require('../middleware/validation');

// @route   GET /api/candidates
// @desc    Get all candidates with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { level, province, district, ward, municipality, status } = req.query;
    
    const filter = {};
    if (level) filter.level = level;
    if (province) filter.province = province;
    if (district) filter.district = district;
    if (ward) filter.ward = ward;
    if (municipality) filter.municipality = municipality;
    if (status) filter.status = status;
    else filter.status = 'active'; // Default to active candidates

    const candidates = await Candidate.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email');

    res.json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch candidates',
      message: error.message,
    });
  }
});

// @route   POST /api/candidates
// @desc    Create new candidate (Admin only)
// @access  Private/Admin
router.post('/', auth, adminAuth, validateCandidate, async (req, res) => {
  try {
    const candidate = new Candidate({
      ...req.body,
      createdBy: req.user._id,
    });

    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create candidate',
      message: error.message,
    });
  }
});

// @route   GET /api/candidates/filters/options
// @desc    Get unique filter options (provinces, districts, etc.)
// @access  Public
router.get('/filters/options', async (req, res) => {
  try {
    const provinces = await Candidate.distinct('province');
    const districts = await Candidate.distinct('district');
    const municipalities = await Candidate.distinct('municipality');
    
    res.json({
      success: true,
      filters: {
        provinces,
        districts,
        municipalities,
        levels: ['local', 'central'],
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch filter options',
      message: error.message,
    });
  }
});

// @route   GET /api/candidates/:id
// @desc    Get single candidate
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json({
      success: true,
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch candidate',
      message: error.message,
    });
  }
});

// @route   PUT /api/candidates/:id
// @desc    Update candidate (Admin only)
// @access  Private/Admin
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json({
      success: true,
      message: 'Candidate updated successfully',
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update candidate',
      message: error.message,
    });
  }
});

// @route   DELETE /api/candidates/:id
// @desc    Delete candidate (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete candidate',
      message: error.message,
    });
  }
});

module.exports = router;

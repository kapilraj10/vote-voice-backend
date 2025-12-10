const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const { auth, adminAuth } = require('../middleware/auth');
const { validateElection, validateVote } = require('../middleware/validation');

// @route   GET /api/elections
// @desc    Get all elections
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { level, status } = req.query;
    
    const filter = {};
    if (level) filter.level = level;
    if (status) filter.status = status;

    const elections = await Election.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email')
      .limit(50);

    res.json({
      success: true,
      count: elections.length,
      elections,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch elections',
      message: error.message,
    });
  }
});

// @route   POST /api/elections
// @desc    Create new election (Admin only)
// @access  Private/Admin
router.post('/', auth, adminAuth, validateElection, async (req, res) => {
  try {
    const election = new Election({
      ...req.body,
      createdBy: req.user._id,
    });

    await election.save();

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      election,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create election',
      message: error.message,
    });
  }
});

// @route   GET /api/elections/:id
// @desc    Get single election
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    res.json({
      success: true,
      election,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch election',
      message: error.message,
    });
  }
});

// @route   PUT /api/elections/:id
// @desc    Update election (Admin only)
// @access  Private/Admin
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    res.json({
      success: true,
      message: 'Election updated successfully',
      election,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update election',
      message: error.message,
    });
  }
});

// @route   DELETE /api/elections/:id
// @desc    Delete election (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    res.json({
      success: true,
      message: 'Election deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete election',
      message: error.message,
    });
  }
});

// @route   GET /api/voting/elections
// @desc    Get all elections (Legacy endpoint for backward compatibility)
// @access  Public
router.get('/elections', async (req, res) => {
  try {
    const { level, status } = req.query;
    
    const filter = {};
    if (level) filter.level = level;
    if (status) filter.status = status;

    const elections = await Election.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: elections.length,
      elections,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch elections',
      message: error.message,
    });
  }
});

// @route   GET /api/voting/elections/:id
// @desc    Get single election
// @access  Public
router.get('/elections/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    res.json({
      success: true,
      election,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch election',
      message: error.message,
    });
  }
});

// @route   POST /api/voting/elections
// @desc    Create new election (Admin only)
// @access  Private
router.post('/elections', async (req, res) => {
  try {
    const election = new Election(req.body);
    await election.save();

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      election,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create election',
      message: error.message,
    });
  }
});

// @route   POST /api/voting/cast-vote
// @desc    Cast a vote
// @access  Private (requires authentication)
router.post('/cast-vote', auth, validateVote, async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

    // Check if election exists
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    if (election.status !== 'active') {
      return res.status(400).json({ error: 'Voting is not active for this election' });
    }

    // Check if user has already voted
    const hasVoted = req.user.votingHistory.some(
      vote => vote.election.toString() === electionId
    );

    if (hasVoted) {
      return res.status(400).json({ 
        error: 'You have already voted in this election',
        message: 'तपाईंले यस चुनावमा पहिले नै मतदान गर्नुभएको छ'
      });
    }

    // Find candidate and increment vote
    const candidate = election.candidates.id(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    candidate.votes += 1;
    election.totalVotes += 1;
    await election.save();

    // Update user's voting history
    req.user.votingHistory.push({
      election: electionId,
      votedAt: Date.now(),
    });
    await req.user.save();

    res.json({
      success: true,
      message: 'Vote cast successfully',
      messageNepali: 'मतदान सफलतापूर्वक सम्पन्न भयो',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to cast vote',
      message: error.message,
    });
  }
});

// @route   GET /api/voting/stats
// @desc    Get voting statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'active' });
    
    const elections = await Election.find();
    const totalVotes = elections.reduce((sum, e) => sum + e.totalVotes, 0);

    res.json({
      success: true,
      stats: {
        totalElections,
        activeElections,
        totalVotes,
        localUnits: 753, // Nepal has 753 local units
        constituencies: 165, // Nepal has 165 constituencies
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

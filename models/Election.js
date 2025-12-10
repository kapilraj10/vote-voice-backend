const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  titleNepali: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  descriptionNepali: {
    type: String,
  },
  level: {
    type: String,
    enum: ['local', 'central'],
    required: true,
  },
  category: {
    type: String,
    enum: ['election', 'referendum', 'policy', 'community_issue'],
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'closed', 'results_announced'],
    default: 'upcoming',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  candidates: [{
    name: {
      type: String,
      required: true,
    },
    nameNepali: String,
    party: String,
    partyNepali: String,
    symbol: String,
    symbolImage: {
      url: String,
      publicId: String,
    },
    profileImage: {
      url: String,
      publicId: String,
    },
    manifesto: String,
    manifestoNepali: String,
    commitmentDocument: {
      url: String,
      publicId: String,
      filename: String,
    },
    age: Number,
    education: String,
    experience: String,
    votes: {
      type: Number,
      default: 0,
    },
  }],
  totalVotes: {
    type: Number,
    default: 0,
  },
  constituency: String,
  ward: String,
  municipality: String,
  district: String,
  province: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
electionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Election', electionSchema);

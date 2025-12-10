const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameNepali: {
    type: String,
    trim: true,
  },
  
  // Party Information
  party: {
    type: String,
    required: true,
  },
  partyNepali: {
    type: String,
  },
  
  // Images
  profileImage: {
    url: String,
    publicId: String,
  },
  symbolImage: {
    url: String,
    publicId: String,
  },
  
  // Location Information
  level: {
    type: String,
    enum: ['local', 'central'],
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  municipality: {
    type: String,
  },
  ward: {
    type: String,
  },
  constituency: {
    type: String,
  },
  
  // Commitment/Manifesto
  commitmentTitle: {
    type: String,
    required: true,
  },
  commitmentTitleNepali: {
    type: String,
  },
  commitmentDescription: {
    type: String,
    required: true,
  },
  commitmentDescriptionNepali: {
    type: String,
  },
  commitmentDocument: {
    url: String,
    publicId: String,
    filename: String,
  },
  
  // Additional Details
  age: Number,
  education: String,
  experience: String,
  
  // Meta Information
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
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

// Update timestamp before saving
candidateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for filtering
candidateSchema.index({ level: 1, province: 1, district: 1, ward: 1, status: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);

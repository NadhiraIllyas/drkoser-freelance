const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  job: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  freelancer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  coverLetter: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  bidAmount: { 
    type: Number, 
    required: true,
    min: 1
  },
  estimatedTime: { 
    type: String, 
    required: true 
  }, // e.g., "2 weeks", "1 month"
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate proposals
proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);
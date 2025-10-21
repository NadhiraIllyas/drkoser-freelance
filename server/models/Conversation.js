const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Ensure unique conversations between users for a job
conversationSchema.index({ participants: 1, job: 1 }, { unique: true });

// Method to get conversation ID
conversationSchema.methods.getConversationId = function() {
  return this._id.toString();
};

module.exports = mongoose.model('Conversation', conversationSchema);
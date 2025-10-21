const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return !this.file; // Content is required if no file
    },
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'document', 'system'],
    default: 'text'
  },
  file: {
    url: String,
    public_id: String,
    original_filename: String,
    fileType: String,
    bytes: Number
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

// Compound index for efficient querying
messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
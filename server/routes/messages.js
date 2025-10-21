const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

const router = express.Router();

// Get or create conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { participantId, jobId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      job: jobId || null
    }).populate('participants', 'name profile');

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, participantId],
        job: jobId || null
      });
      await conversation.save();
      await conversation.populate('participants', 'name profile');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error creating conversation' });
  }
});

// Get user's conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'name profile')
    .populate('job', 'title')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId, 
        receiver: req.user._id,
        isRead: false 
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// Mark messages as read
router.put('/messages/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { 
        _id: req.params.messageId,
        receiver: req.user._id 
      },
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error marking message as read' });
  }
});

module.exports = router;
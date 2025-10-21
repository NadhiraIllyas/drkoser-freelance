const socketIO = require('socket.io');

// Store online users
const onlineUsers = new Map();

const configureSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // User joins the app
    socket.on('user_online', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} is online`);
      
      // Broadcast to relevant users that this user is online
      socket.broadcast.emit('user_status_change', {
        userId,
        status: 'online'
      });
    });

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.id} left conversation: ${conversationId}`);
    });

    // Send a message
    socket.on('send_message', async (messageData) => {
      try {
        console.log('💬 Message received:', messageData);
        
        // Save message to database (we'll create this later)
        const savedMessage = {
          _id: Date.now().toString(), // Temporary ID
          ...messageData,
          timestamp: new Date()
        };

        // Broadcast to all users in the conversation
        io.to(messageData.conversationId).emit('receive_message', savedMessage);
        
        // Notify other users in conversation about new message
        socket.to(messageData.conversationId).emit('new_message_notification', {
          conversationId: messageData.conversationId,
          senderName: messageData.senderName,
          preview: messageData.content.substring(0, 50) + '...'
        });

      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('message_error', {
          error: 'Failed to send message',
          originalMessage: messageData
        });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      socket.to(data.conversationId).emit('user_typing', {
        userId: data.userId,
        userName: data.userName
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.conversationId).emit('user_stop_typing', {
        userId: data.userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id);
      
      // Find and remove user from online users
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          
          // Broadcast that user went offline
          socket.broadcast.emit('user_status_change', {
            userId,
            status: 'offline'
          });
          break;
        }
      }
    });
  });

  return io;
};

module.exports = { configureSocket, onlineUsers };
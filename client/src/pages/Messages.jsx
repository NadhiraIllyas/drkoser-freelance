import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const { conversationId } = useParams();

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (conversationId) {
      const conversation = conversations.find(c => c._id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversationId);
      }
    }
  }, [conversationId, conversations]);

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (newMessage) => {
        if (selectedConversation && newMessage.conversationId === selectedConversation._id) {
          setMessages(prev => [...prev, newMessage]);
        }
        // Update conversations list with new message
        updateConversationLastMessage(newMessage);
      });

      socket.on('new_message_notification', (notification) => {
        if (!selectedConversation || notification.conversationId !== selectedConversation._id) {
          // Show desktop notification or update badge
          console.log('New message notification:', notification);
        }
      });

      return () => {
        socket.off('receive_message');
        socket.off('new_message_notification');
      };
    }
  }, [socket, selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const response = await api.get(`/messages/conversations/${convId}/messages`);
      setMessages(response.data);
      
      // Join conversation room for real-time updates
      if (socket) {
        socket.emit('join_conversation', convId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const updateConversationLastMessage = (message) => {
    setConversations(prev => 
      prev.map(conv => 
        conv._id === message.conversationId 
          ? { ...conv, lastMessage: message, lastMessageAt: new Date() }
          : conv
      ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
    );
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    if (socket && selectedConversation) {
      socket.emit('leave_conversation', selectedConversation._id);
    }
  };

  const handleSendMessage = (content) => {
    if (!selectedConversation || !content.trim()) return;

    const messageData = {
      conversationId: selectedConversation._id,
      sender: user.id,
      senderName: user.name,
      receiver: selectedConversation.participants.find(p => p._id !== user.id)?._id,
      content: content.trim(),
      timestamp: new Date()
    };

    // Send via WebSocket
    if (socket) {
      socket.emit('send_message', messageData);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Conversations List */}
        <div className="md:w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 text-sm">Chat with clients and freelancers</p>
          </div>
          
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            isUserOnline={isUserOnline}
            currentUser={user}
          />
        </div>

        {/* Chat Window */}
        <div className="md:w-2/3 flex flex-col">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={user}
              isUserOnline={isUserOnline}
              socket={socket}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
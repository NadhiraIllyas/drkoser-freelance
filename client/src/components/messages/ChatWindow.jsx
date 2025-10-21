import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import FileUpload from '../upload/FileUpload';

const ChatWindow = ({ 
  conversation, 
  messages, 
  onSendMessage, 
  currentUser, 
  isUserOnline,
  socket 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherParticipant = conversation.participants.find(p => p._id !== currentUser.id);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing indicators
  useEffect(() => {
    if (socket) {
      socket.on('user_typing', (data) => {
        if (data.userId !== currentUser.id) {
          setIsTyping(true);
          setTypingUser(data.userName);
        }
      });

      socket.on('user_stop_typing', (data) => {
        if (data.userId !== currentUser.id) {
          setIsTyping(false);
          setTypingUser(null);
        }
      });

      return () => {
        socket.off('user_typing');
        socket.off('user_stop_typing');
      };
    }
  }, [socket, currentUser.id]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Typing indicators
    if (socket) {
      socket.emit('typing_start', {
        conversationId: conversation._id,
        userId: currentUser.id,
        userName: currentUser.name
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', {
          conversationId: conversation._id,
          userId: currentUser.id
        });
      }, 1000);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    onSendMessage(newMessage);
    setNewMessage('');

    // Stop typing indicator
    if (socket) {
      socket.emit('typing_stop', {
        conversationId: conversation._id,
        userId: currentUser.id
      });
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileUpload = async (uploadedFiles) => {
    if (!selectedConversation || uploadedFiles.length === 0) return;

    const file = uploadedFiles[0];
    
    const messageData = {
      conversationId: conversation._id,
      sender: currentUser.id,
      senderName: currentUser.name,
      receiver: otherParticipant?._id,
      content: `Shared a file: ${file.original_filename}`,
      messageType: file.format.startsWith('image/') ? 'image' : 'document',
      file: file,
      timestamp: new Date()
    };

    // Send via WebSocket
    if (socket) {
      socket.emit('send_message', messageData);
    }

    setShowFileUpload(false);
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isSameSender = (currentMessage, previousMessage) => {
    return previousMessage && 
           currentMessage.sender?._id === previousMessage.sender?._id &&
           (new Date(currentMessage.timestamp) - new Date(previousMessage.timestamp)) < 300000; // 5 minutes
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'pdf') return '📄';
    if (fileType.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {otherParticipant?.name?.charAt(0) || 'U'}
            </div>
            {isUserOnline(otherParticipant?._id) && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {otherParticipant?.name || 'Unknown User'}
            </h2>
            <p className="text-sm text-gray-600">
              {isUserOnline(otherParticipant?._id) ? 'Online' : 'Offline'}
              {conversation.job && ` • ${conversation.job.title}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-gray-600">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => {
              const isOwnMessage = message.sender?._id === currentUser.id;
              const showAvatar = !isSameSender(message, messages[index - 1]);

              return (
                <div
                  key={message._id || index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                    {/* Avatar */}
                    {showAvatar && !isOwnMessage && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {message.sender?.name?.charAt(0) || 'U'}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-full ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      {/* File Message */}
                      {message.file && (
                        <div className="mb-2">
                          {message.messageType === 'image' ? (
                            <div className="max-w-xs">
                              <img
                                src={message.file.url}
                                alt={message.file.original_filename}
                                className="rounded-lg border border-gray-200 max-h-48 object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30">
                              <span className="text-2xl">
                                {getFileIcon(message.file.fileType)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {message.file.original_filename}
                                </p>
                                <p className="text-xs opacity-80">
                                  {(message.file.bytes / 1024).toFixed(1)} KB • {message.file.fileType.toUpperCase()}
                                </p>
                              </div>
                              <a
                                href={message.file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-2 py-1 rounded transition-colors"
                              >
                                View
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Text Content */}
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                        }`}
                      >
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>

                    {/* Spacer for alignment */}
                    {showAvatar && isOwnMessage && <div className="w-8"></div>}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {typingUser?.charAt(0) || 'U'}
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* File Upload Section */}
      {showFileUpload && (
        <div className="border-t border-gray-200 bg-white">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">Attach File</h4>
              <button
                onClick={() => setShowFileUpload(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
                title="Close file upload"
              >
                ✕
              </button>
            </div>
            <FileUpload
              onUploadComplete={handleFileUpload}
              maxFiles={1}
              acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx']}
            />
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
              showFileUpload ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Attach file"
          >
            <span className="text-xl">📎</span>
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 input-field rounded-full"
            maxLength={2000}
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary rounded-full px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • {2000 - newMessage.length} characters remaining
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
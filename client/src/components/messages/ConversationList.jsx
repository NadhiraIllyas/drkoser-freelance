import React from 'react';
import { Link } from 'react-router-dom';

const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  isUserOnline, 
  currentUser 
}) => {
  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== currentUser.id);
  };

  const formatLastMessage = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const message = conversation.lastMessage.content;
    return message.length > 40 ? message.substring(0, 40) + '...' : message;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
        <p className="text-gray-600 text-sm">
          Start a conversation by accepting a proposal or from a job listing.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        const isOnline = isUserOnline(otherParticipant?._id);
        const isSelected = selectedConversation?._id === conversation._id;

        return (
          <div
            key={conversation._id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-blue-50 border-blue-200' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {otherParticipant?.name?.charAt(0) || 'U'}
                </div>
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {otherParticipant?.name || 'Unknown User'}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTime(conversation.lastMessageAt)}
                  </span>
                </div>

                {conversation.job && (
                  <p className="text-xs text-blue-600 mb-1 truncate">
                    Re: {conversation.job.title}
                  </p>
                )}

                <p className="text-sm text-gray-600 truncate">
                  {formatLastMessage(conversation)}
                </p>

                {/* Unread badge - you can implement this later */}
                {/* {conversation.unreadCount > 0 && (
                  <div className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full ml-2">
                    {conversation.unreadCount}
                  </div>
                )} */}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
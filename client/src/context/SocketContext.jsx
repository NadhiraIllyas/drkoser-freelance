import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to WebSocket server
      const newSocket = io('http://localhost:5000', {
        withCredentials: true
      });

      setSocket(newSocket);

      // Notify server that user is online
      newSocket.emit('user_online', user.id);

      // Listen for online users updates
      newSocket.on('user_status_change', (data) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          if (data.status === 'online') {
            updated.add(data.userId);
          } else {
            updated.delete(data.userId);
          }
          return updated;
        });
      });

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [user]);

  const value = {
    socket,
    onlineUsers,
    isUserOnline: (userId) => onlineUsers.has(userId)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', { transports: ['websocket', 'polling'] });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('joinRoom', user._id);
      if (user.role === 'admin' || user.role === 'authority') {
        socket.emit('joinRoleRoom', user.role);
      }
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

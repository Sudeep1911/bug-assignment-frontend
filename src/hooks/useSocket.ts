// hooks/useSocket.ts
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:3000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const isConnected = useRef(false);

  useEffect(() => {
    if (!socket && !isConnected.current) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      isConnected.current = true;

      return () => {
        newSocket.disconnect();
        isConnected.current = false;
      };
    }
  }, [socket]);

  return socket;
};

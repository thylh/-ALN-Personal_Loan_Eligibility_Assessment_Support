import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [onlineActors, setOnlineActors] = useState([]);
  const [activeLoanEvent, setActiveLoanEvent] = useState(null);

  useEffect(() => {
    // Connect to backend Socket.IO
    // In dev, Vite proxies /api, and socket connects to root host or localhost:5000
    const socketUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : window.location.origin;

    const newSocket = io(socketUrl, {
      auth: { token: token || localStorage.getItem('token') },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[Socket Client] Connected to Realtime Gateway. Socket ID:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket Client] Disconnected from Realtime Gateway.');
      setConnected(false);
    });

    // Handle generic live notifications
    newSocket.on('notification:new', (notif) => {
      console.log('[Socket Notification]', notif);
      setLiveNotifications(prev => [notif, ...prev]);
    });

    // Handle presence
    newSocket.on('presence:online', (actor) => {
      setOnlineActors(prev => [...prev.filter(a => a.userId !== actor.userId), actor]);
    });

    newSocket.on('presence:offline', ({ userId }) => {
      setOnlineActors(prev => prev.filter(a => a.userId !== userId));
    });

    // Global loan event listeners
    newSocket.on('loan:status_updated', (event) => {
      console.log('[Socket Event: Status Updated]', event);
      setActiveLoanEvent({ type: 'STATUS_UPDATED', ...event });
    });

    newSocket.on('loan:decision_received', (event) => {
      console.log('[Socket Event: Decision Received]', event);
      setActiveLoanEvent({ type: 'DECISION', ...event });
    });

    newSocket.on('loan:supplement_requested', (event) => {
      console.log('[Socket Event: Supplement Requested]', event);
      setActiveLoanEvent({ type: 'SUPPLEMENT_REQUESTED', ...event });
    });

    newSocket.on('loan:new_application', (event) => {
      console.log('[Socket Event: New Application Submitted]', event);
      setActiveLoanEvent({ type: 'NEW_APPLICATION', ...event });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Helper actions
  const joinLoanRoom = (loanId) => {
    if (socket && connected && loanId) {
      socket.emit('loan:join_room', { loanId });
    }
  };

  const leaveLoanRoom = (loanId) => {
    if (socket && connected && loanId) {
      socket.emit('loan:leave_room', { loanId });
    }
  };

  const syncFormField = (loanId, fieldName, fieldValue, step = 1) => {
    if (socket && connected && loanId) {
      socket.emit('loan:form_field_change', { loanId, fieldName, fieldValue, step });
    }
  };

  const saveDraftRealtime = (draftData) => {
    return new Promise((resolve) => {
      if (socket && connected) {
        socket.emit('loan:save_draft', draftData, (response) => {
          resolve(response);
        });
      } else {
        resolve({ success: false, message: 'Socket chưa kết nối.' });
      }
    });
  };

  const sendCommentRealtime = (loanId, content, attachments = []) => {
    return new Promise((resolve) => {
      if (socket && connected) {
        socket.emit('loan:send_comment', { loanId, content, attachments }, (response) => {
          resolve(response);
        });
      } else {
        resolve({ success: false, message: 'Socket chưa kết nối.' });
      }
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        liveNotifications,
        onlineActors,
        activeLoanEvent,
        joinLoanRoom,
        leaveLoanRoom,
        syncFormField,
        saveDraftRealtime,
        sendCommentRealtime,
        clearActiveLoanEvent: () => setActiveLoanEvent(null)
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
};

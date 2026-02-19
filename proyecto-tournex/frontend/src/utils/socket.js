import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

let socket = null;

export const initSocket = (token) => {
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// Room management
export const joinTournament = (tournamentId) => {
  if (socket) socket.emit('join_tournament', tournamentId);
};

export const leaveTournament = (tournamentId) => {
  if (socket) socket.emit('leave_tournament', tournamentId);
};

export const joinMatch = (matchId) => {
  if (socket) socket.emit('join_match', matchId);
};

export const leaveMatch = (matchId) => {
  if (socket) socket.emit('leave_match', matchId);
};

// Typing indicators
export const emitTyping = (contextType, contextId) => {
  if (socket) socket.emit('typing', { contextType, contextId });
};

export const emitStopTyping = (contextType, contextId) => {
  if (socket) socket.emit('stop_typing', { contextType, contextId });
};

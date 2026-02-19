import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

let io = null;

/**
 * Inicializar Socket.IO
 */
export const initializeSocket = (server) => {
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000'];

  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      credentials: true
    }
  });

  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Conexión de socket
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user._id})`);

    // Unirse a sala personal del usuario
    socket.join(`user:${socket.user._id}`);

    // Evento: Unirse a sala de torneo
    socket.on('join_tournament', (tournamentId) => {
      socket.join(`tournament:${tournamentId}`);
      console.log(`${socket.user.username} joined tournament:${tournamentId}`);
    });

    // Evento: Salir de sala de torneo
    socket.on('leave_tournament', (tournamentId) => {
      socket.leave(`tournament:${tournamentId}`);
      console.log(`${socket.user.username} left tournament:${tournamentId}`);
    });

    // Evento: Unirse a sala de partido
    socket.on('join_match', (matchId) => {
      socket.join(`match:${matchId}`);
      console.log(`${socket.user.username} joined match:${matchId}`);
    });

    // Evento: Salir de sala de partido
    socket.on('leave_match', (matchId) => {
      socket.leave(`match:${matchId}`);
      console.log(`${socket.user.username} left match:${matchId}`);
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });

  return io;
};

/**
 * Obtener instancia de Socket.IO
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emitir notificación a usuario específico
 */
export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('new_notification', notification);
  }
};

/**
 * Emitir actualización de partido
 */
export const emitMatchUpdate = (matchId, update) => {
  if (io) {
    io.to(`match:${matchId}`).emit('match_updated', update);
  }
};

/**
 * Emitir reporte de partido
 */
export const emitMatchReported = (matchId, report) => {
  if (io) {
    io.to(`match:${matchId}`).emit('match_reported', report);
  }
};

/**
 * Emitir actualización de torneo
 */
export const emitTournamentUpdate = (tournamentId, update) => {
  if (io) {
    io.to(`tournament:${tournamentId}`).emit('tournament_updated', update);
  }
};

/**
 * Emitir inicio de torneo
 */
export const emitTournamentStart = (tournamentId) => {
  if (io) {
    io.to(`tournament:${tournamentId}`).emit('tournament_started', {
      message: 'The tournament has started!'
    });
  }
};

/**
 * Emitir fin de torneo
 */
export const emitTournamentEnd = (tournamentId, winner) => {
  if (io) {
    io.to(`tournament:${tournamentId}`).emit('tournament_ended', {
      message: 'The tournament has ended!',
      winner
    });
  }
};

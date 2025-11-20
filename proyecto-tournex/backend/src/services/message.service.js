import Message from '../models/Message.js';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import Team from '../models/Team.js';
import { ApiError } from '../utils/errorHandler.js';
import { emitMessage, emitMessageDeleted, emitMessageEdited } from '../config/socket.js';

/**
 * Validar acceso al contexto
 */
const validateContextAccess = async (contextType, contextId, userId, userRole) => {
  let hasAccess = false;

  switch (contextType) {
    case 'tournament':
      const tournament = await Tournament.findById(contextId);
      if (!tournament) {
        throw new ApiError(404, 'Tournament not found');
      }
      // Todos los participantes registrados pueden ver el chat
      const TournamentParticipant = (await import('../models/TournamentParticipant.js')).default;
      const isParticipant = await TournamentParticipant.findOne({
        tournament: contextId,
        $or: [
          { player: userId },
          { team: { $exists: true } }
        ]
      });
      hasAccess = isParticipant || userRole === 'admin';
      break;

    case 'match':
      const match = await Match.findById(contextId)
        .populate('participant1 participant2');
      if (!match) {
        throw new ApiError(404, 'Match not found');
      }
      // Participantes del partido, árbitro asignado o admin
      const isMatchParticipant = 
        match.participant1?.player?.toString() === userId.toString() ||
        match.participant1?.team?.toString() === userId.toString() ||
        match.participant2?.player?.toString() === userId.toString() ||
        match.participant2?.team?.toString() === userId.toString() ||
        match.assignedReferee?.toString() === userId.toString();
      hasAccess = isMatchParticipant || userRole === 'admin';
      break;

    case 'team':
      const team = await Team.findById(contextId);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      // Miembros del equipo o admin
      const isMember = team.captain.toString() === userId.toString() ||
        team.members.some(m => m.player.toString() === userId.toString());
      hasAccess = isMember || userRole === 'admin';
      break;

    default:
      throw new ApiError(400, 'Invalid context type');
  }

  if (!hasAccess) {
    throw new ApiError(403, 'Not authorized to access this chat');
  }

  return true;
};

/**
 * Enviar mensaje
 */
export const sendMessage = async (data, senderId, senderRole) => {
  const { contextType, contextId, content } = data;

  // Validar acceso al contexto
  await validateContextAccess(contextType, contextId, senderId, senderRole);

  const message = await Message.create({
    sender: senderId,
    contextType,
    contextId,
    content
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'username avatar role')
    .lean();

  // Emitir evento Socket.IO
  emitMessage(contextType, contextId, populatedMessage);

  return populatedMessage;
};

/**
 * Obtener mensajes de un contexto
 */
export const getMessages = async (contextType, contextId, userId, userRole, options = {}) => {
  // Validar acceso al contexto
  await validateContextAccess(contextType, contextId, userId, userRole);

  const {
    page = 1,
    limit = 50,
    before = null // Timestamp para cargar mensajes anteriores
  } = options;

  const query = {
    contextType,
    contextId,
    isDeleted: false
  };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar role')
      .lean(),
    Message.countDocuments(query)
  ]);

  return {
    messages: messages.reverse(), // Ordenar cronológicamente para el cliente
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Eliminar mensaje (soft delete)
 */
export const deleteMessage = async (messageId, userId, userRole) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (message.isDeleted) {
    throw new ApiError(400, 'Message already deleted');
  }

  // Solo el autor o admin puede eliminar
  const isAuthor = message.sender.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isAuthor && !isAdmin) {
    throw new ApiError(403, 'Not authorized to delete this message');
  }

  message.isDeleted = true;
  message.deletedBy = userId;
  message.deletedAt = new Date();
  await message.save();

  // Emitir evento Socket.IO
  emitMessageDeleted(message.contextType, message.contextId, messageId);

  return { message: 'Message deleted successfully' };
};

/**
 * Editar mensaje
 */
export const editMessage = async (messageId, newContent, userId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (message.isDeleted) {
    throw new ApiError(400, 'Cannot edit deleted message');
  }

  // Solo el autor puede editar
  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to edit this message');
  }

  // No permitir edición después de 15 minutos
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  if (message.createdAt < fifteenMinutesAgo) {
    throw new ApiError(400, 'Cannot edit message after 15 minutes');
  }

  message.content = newContent;
  message.isEdited = true;
  await message.save();

  const updatedMessage = await Message.findById(messageId)
    .populate('sender', 'username avatar role')
    .lean();

  // Emitir evento Socket.IO
  emitMessageEdited(message.contextType, message.contextId, updatedMessage);

  return updatedMessage;
};

/**
 * Obtener contextos de chat activos para un usuario
 */
export const getActiveChats = async (userId) => {
  const User = (await import('../models/User.js')).default;
  const user = await User.findById(userId).populate('currentTeam');

  const activeChats = [];

  // Chats de equipos
  if (user.currentTeam) {
    activeChats.push({
      type: 'team',
      id: user.currentTeam._id,
      name: user.currentTeam.name,
      avatar: user.currentTeam.avatar
    });
  }

  // Chats de torneos activos
  const TournamentParticipant = (await import('../models/TournamentParticipant.js')).default;
  const tournamentParticipations = await TournamentParticipant.find({
    $or: [
      { player: userId },
      { team: user.currentTeam?._id }
    ],
    status: { $in: ['approved', 'checked_in'] }
  }).populate('tournament', 'name game avatar status');

  for (const participation of tournamentParticipations) {
    if (participation.tournament.status !== 'completed' && participation.tournament.status !== 'cancelled') {
      activeChats.push({
        type: 'tournament',
        id: participation.tournament._id,
        name: participation.tournament.name,
        game: participation.tournament.game,
        avatar: participation.tournament.avatar
      });
    }
  }

  // Chats de partidos activos (como árbitro o participante)
  const matches = await Match.find({
    $or: [
      { assignedReferee: userId },
      { participant1: { $exists: true } },
      { participant2: { $exists: true } }
    ],
    status: { $in: ['pending', 'in_progress'] }
  })
    .populate('tournament', 'name game')
    .populate('participant1 participant2')
    .lean();

  for (const match of matches) {
    // Verificar si el usuario es participante
    const isParticipant = 
      match.participant1?.player?.toString() === userId.toString() ||
      match.participant2?.player?.toString() === userId.toString() ||
      match.assignedReferee?.toString() === userId.toString();

    if (isParticipant) {
      activeChats.push({
        type: 'match',
        id: match._id,
        name: `Match - Round ${match.round}`,
        tournament: match.tournament.name,
        game: match.tournament.game
      });
    }
  }

  return activeChats;
};

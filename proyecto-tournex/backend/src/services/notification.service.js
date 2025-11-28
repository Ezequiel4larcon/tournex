import Notification from '../models/Notification.js';
import { ApiError } from '../utils/errorHandler.js';
import { emitNotification } from '../config/socket.js';

/**
 * Crear una notificación
 */
export const createNotification = async (data) => {
  const { recipient, type, message, relatedEntity } = data;

  const notification = await Notification.create({
    recipient,
    type,
    message,
    relatedEntity
  });

  // Emitir evento Socket.IO para notificación en tiempo real
  emitNotification(recipient, notification);

  return notification;
};

/**
 * Obtener notificaciones del usuario autenticado
 */
export const getMyNotifications = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false
  } = options;

  const query = { recipient: userId };
  
  if (unreadOnly) {
    query.isRead = false;
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query)
  ]);

  return {
    notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Marcar notificación como leída
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.recipient.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this notification');
  }

  if (notification.isRead) {
    return notification;
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { 
      isRead: true,
      readAt: new Date()
    }
  );

  return {
    modifiedCount: result.modifiedCount
  };
};

/**
 * Eliminar notificación
 */
export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.recipient.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to delete this notification');
  }

  await notification.deleteOne();

  return { message: 'Notification deleted successfully' };
};

/**
 * Obtener contador de notificaciones no leídas
 */
export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false
  });

  return { unreadCount: count };
};

/**
 * Crear notificación de registro a torneo
 */
export const createTournamentRegistrationNotification = async (recipientId, tournamentId, tournamentName) => {
  return createNotification({
    recipient: recipientId,
    type: 'tournament_registration',
    message: `Te has registrado exitosamente en el torneo ${tournamentName}`,
    relatedEntity: {
      entityType: 'Tournament',
      entityId: tournamentId
    }
  });
};

/**
 * Crear notificación de partido reportado
 */
export const createMatchReportedNotification = async (recipientId, matchId) => {
  return createNotification({
    recipient: recipientId,
    type: 'match_reported',
    message: 'Se ha reportado el resultado de tu partido',
    relatedEntity: {
      entityType: 'Match',
      entityId: matchId
    }
  });
};

/**
 * Crear notificación de inicio de torneo
 */
export const createTournamentStartNotification = async (recipientId, tournamentId, tournamentName) => {
  return createNotification({
    recipient: recipientId,
    type: 'tournament_start',
    message: `El torneo ${tournamentName} ha comenzado`,
    relatedEntity: {
      entityType: 'Tournament',
      entityId: tournamentId
    }
  });
};

/**
 * Crear notificación de finalización de torneo
 */
export const createTournamentEndNotification = async (recipientId, tournamentId, tournamentName) => {
  return createNotification({
    recipient: recipientId,
    type: 'tournament_end',
    message: `El torneo ${tournamentName} ha finalizado`,
    relatedEntity: {
      entityType: 'Tournament',
      entityId: tournamentId
    }
  });
};

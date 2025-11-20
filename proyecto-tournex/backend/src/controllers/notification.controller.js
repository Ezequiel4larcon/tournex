import * as notificationService from '../services/notification.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

/**
 * @route   GET /api/notifications
 * @desc    Obtener notificaciones del usuario autenticado
 * @access  Private
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, unreadOnly } = req.query;
  
  const result = await notificationService.getMyNotifications(
    req.user._id,
    { page, limit, unreadOnly: unreadOnly === 'true' }
  );

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obtener contador de notificaciones no leídas
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar notificación como leída
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    notification
  });
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marcar todas las notificaciones como leídas
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    ...result
  });
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Eliminar notificación
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(
    req.params.id,
    req.user._id
  );

  res.status(200).json({
    success: true,
    ...result
  });
});

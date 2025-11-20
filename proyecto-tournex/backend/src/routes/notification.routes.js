import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as notificationController from '../controllers/notification.controller.js';
import { param } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validaciones
const idValidation = [
  param('id').isMongoId().withMessage('Invalid notification ID')
];

// Todas las rutas requieren autenticación
router.use(protect);

/**
 * @route   GET /api/notifications
 * @desc    Obtener notificaciones del usuario
 * @query   page, limit, unreadOnly
 */
router.get('/', notificationController.getMyNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Contador de notificaciones no leídas
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marcar todas como leídas
 */
router.put('/read-all', notificationController.markAllAsRead);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar notificación como leída
 */
router.put(
  '/:id/read',
  idValidation,
  validateRequest,
  notificationController.markAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Eliminar notificación
 */
router.delete(
  '/:id',
  idValidation,
  validateRequest,
  notificationController.deleteNotification
);

export default router;

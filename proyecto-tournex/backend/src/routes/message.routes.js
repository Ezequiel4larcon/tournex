import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as messageController from '../controllers/message.controller.js';
import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validaciones
const sendMessageValidation = [
  body('contextType')
    .isIn(['tournament', 'match', 'team'])
    .withMessage('Context type must be tournament, match, or team'),
  body('contextId')
    .isMongoId()
    .withMessage('Invalid context ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters')
];

const editMessageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters')
];

const getMessagesValidation = [
  param('contextType')
    .isIn(['tournament', 'match', 'team'])
    .withMessage('Context type must be tournament, match, or team'),
  param('contextId')
    .isMongoId()
    .withMessage('Invalid context ID')
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid message ID')
];

// Todas las rutas requieren autenticación
router.use(protect);

/**
 * @route   GET /api/messages/chats
 * @desc    Obtener chats activos del usuario
 */
router.get('/chats', messageController.getActiveChats);

/**
 * @route   POST /api/messages
 * @desc    Enviar mensaje
 */
router.post(
  '/',
  sendMessageValidation,
  validateRequest,
  messageController.sendMessage
);

/**
 * @route   GET /api/messages/:contextType/:contextId
 * @desc    Obtener mensajes de un contexto
 * @query   page, limit, before
 */
router.get(
  '/:contextType/:contextId',
  getMessagesValidation,
  validateRequest,
  messageController.getMessages
);

/**
 * @route   PUT /api/messages/:id
 * @desc    Editar mensaje
 */
router.put(
  '/:id',
  idValidation,
  editMessageValidation,
  validateRequest,
  messageController.editMessage
);

/**
 * @route   DELETE /api/messages/:id
 * @desc    Eliminar mensaje
 */
router.delete(
  '/:id',
  idValidation,
  validateRequest,
  messageController.deleteMessage
);

export default router;

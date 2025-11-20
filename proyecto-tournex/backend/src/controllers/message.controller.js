import * as messageService from '../services/message.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

/**
 * @route   POST /api/messages
 * @desc    Enviar mensaje a un chat
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage(
    req.body,
    req.user._id,
    req.user.role
  );

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: message
  });
});

/**
 * @route   GET /api/messages/:contextType/:contextId
 * @desc    Obtener mensajes de un contexto
 * @access  Private
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { contextType, contextId } = req.params;
  const { page, limit, before } = req.query;

  const result = await messageService.getMessages(
    contextType,
    contextId,
    req.user._id,
    req.user.role,
    { page, limit, before }
  );

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   DELETE /api/messages/:id
 * @desc    Eliminar mensaje (soft delete)
 * @access  Private
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const result = await messageService.deleteMessage(
    req.params.id,
    req.user._id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   PUT /api/messages/:id
 * @desc    Editar mensaje
 * @access  Private
 */
export const editMessage = asyncHandler(async (req, res) => {
  const message = await messageService.editMessage(
    req.params.id,
    req.body.content,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: 'Message updated successfully',
    data: message
  });
});

/**
 * @route   GET /api/messages/chats
 * @desc    Obtener chats activos del usuario
 * @access  Private
 */
export const getActiveChats = asyncHandler(async (req, res) => {
  const chats = await messageService.getActiveChats(req.user._id);

  res.status(200).json({
    success: true,
    chats
  });
});

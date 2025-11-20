import * as commentService from '../services/comment.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

/**
 * @desc    Crear nuevo comentario/post
 * @route   POST /api/comments
 * @access  Private
 */
export const createComment = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  const comment = await commentService.createComment(
    { title, content, category, tags },
    req.user._id
  );

  res.status(201).json({
    success: true,
    message: 'Comment created successfully',
    data: comment
  });
});

/**
 * @desc    Obtener todos los comentarios
 * @route   GET /api/comments
 * @access  Public
 */
export const getAllComments = asyncHandler(async (req, res) => {
  const { category, author, isPinned, page, limit, search } = req.query;

  const result = await commentService.getAllComments({
    category,
    author,
    isPinned: isPinned === 'true' ? true : isPinned === 'false' ? false : undefined,
    page,
    limit,
    search
  });

  res.status(200).json({
    success: true,
    data: result.comments,
    pagination: result.pagination
  });
});

/**
 * @desc    Obtener comentario por ID
 * @route   GET /api/comments/:id
 * @access  Public
 */
export const getCommentById = asyncHandler(async (req, res) => {
  const comment = await commentService.getCommentById(req.params.id, true);

  res.status(200).json({
    success: true,
    data: comment
  });
});

/**
 * @desc    Actualizar comentario
 * @route   PUT /api/comments/:id
 * @access  Private
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  const comment = await commentService.updateComment(
    req.params.id,
    { title, content, category, tags },
    req.user._id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    data: comment
  });
});

/**
 * @desc    Eliminar comentario
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const result = await commentService.deleteComment(
    req.params.id,
    req.user._id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Agregar respuesta a un comentario
 * @route   POST /api/comments/:id/replies
 * @access  Private
 */
export const addReply = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const comment = await commentService.addReply(
    req.params.id,
    { content },
    req.user._id
  );

  res.status(201).json({
    success: true,
    message: 'Reply added successfully',
    data: comment
  });
});

/**
 * @desc    Toggle like en un comentario
 * @route   POST /api/comments/:id/like
 * @access  Private
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const result = await commentService.toggleLike(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: result.liked ? 'Comment liked' : 'Comment unliked',
    data: result
  });
});

/**
 * @desc    Toggle pin de un comentario (admin/moderador)
 * @route   POST /api/comments/:id/pin
 * @access  Private (Admin/Moderator)
 */
export const togglePin = asyncHandler(async (req, res) => {
  const comment = await commentService.togglePin(req.params.id, req.user.role);

  res.status(200).json({
    success: true,
    message: comment.isPinned ? 'Comment pinned' : 'Comment unpinned',
    data: comment
  });
});

import Comment from '../models/Comment.js';
import { ApiError } from '../utils/errorHandler.js';

/**
 * Servicio para crear un nuevo comentario/post
 */
export const createComment = async (commentData, authorId) => {
  const comment = await Comment.create({
    ...commentData,
    author: authorId
  });

  await comment.populate('author', 'username email avatar');

  // Emitir evento de nuevo comentario (Event-driven)
  return comment;
};

/**
 * Servicio para obtener todos los comentarios con filtros
 */
export const getAllComments = async (filters = {}) => {
  const { category, author, isPinned, page = 1, limit = 10, search } = filters;

  const query = { isPublished: true };

  if (category) query.category = category;
  if (author) query.author = author;
  if (isPinned !== undefined) query.isPinned = isPinned;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .populate('author', 'username email avatar')
      .populate('attachments')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Comment.countDocuments(query)
  ]);

  return {
    comments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Servicio para obtener un comentario por ID
 */
export const getCommentById = async (commentId, incrementView = false) => {
  const comment = await Comment.findById(commentId)
    .populate('author', 'username email avatar')
    .populate('replies.author', 'username email avatar')
    .populate('attachments');

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Incrementar vistas si se solicita
  if (incrementView) {
    comment.views += 1;
    await comment.save();
  }

  return comment;
};

/**
 * Servicio para actualizar un comentario
 */
export const updateComment = async (commentId, updateData, userId, userRole) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Verificar permisos: solo el autor o admin/moderador puede actualizar
  if (comment.author.toString() !== userId && !['admin', 'moderator'].includes(userRole)) {
    throw new ApiError(403, 'Not authorized to update this comment');
  }

  Object.assign(comment, updateData);
  await comment.save();

  await comment.populate('author', 'username email avatar');

  return comment;
};

/**
 * Servicio para eliminar un comentario
 */
export const deleteComment = async (commentId, userId, userRole) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Verificar permisos
  if (comment.author.toString() !== userId && !['admin', 'moderator'].includes(userRole)) {
    throw new ApiError(403, 'Not authorized to delete this comment');
  }

  await comment.deleteOne();

  return { message: 'Comment deleted successfully' };
};

/**
 * Servicio para agregar una respuesta a un comentario
 */
export const addReply = async (commentId, replyData, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  comment.replies.push({
    author: userId,
    content: replyData.content
  });

  await comment.save();
  await comment.populate('replies.author', 'username email avatar');

  // Emitir evento de nueva respuesta (Event-driven)
  return comment;
};

/**
 * Servicio para dar like/unlike a un comentario
 */
export const toggleLike = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  const likeIndex = comment.likes.indexOf(userId);

  if (likeIndex > -1) {
    // Si ya tiene like, quitarlo
    comment.likes.splice(likeIndex, 1);
  } else {
    // Si no tiene like, agregarlo
    comment.likes.push(userId);
  }

  await comment.save();

  return {
    liked: likeIndex === -1,
    likesCount: comment.likes.length
  };
};

/**
 * Servicio para marcar un comentario como destacado (solo admin/moderador)
 */
export const togglePin = async (commentId, userRole) => {
  if (!['admin', 'moderator'].includes(userRole)) {
    throw new ApiError(403, 'Not authorized to pin comments');
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  comment.isPinned = !comment.isPinned;
  await comment.save();

  return comment;
};

import express from 'express';
import { body, query } from 'express-validator';
import * as commentController from '../controllers/comment.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validaciones
const createCommentValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'technology', 'sports', 'entertainment', 'education', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  validateRequest
];

const updateCommentValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'technology', 'sports', 'entertainment', 'education', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  validateRequest
];

const addReplyValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Reply content must be between 1 and 1000 characters'),
  validateRequest
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validateRequest
];

// Rutas públicas
router.get('/', queryValidation, commentController.getAllComments);
router.get('/:id', commentController.getCommentById);

// Rutas protegidas
router.post('/', protect, createCommentValidation, commentController.createComment);
router.put('/:id', protect, updateCommentValidation, commentController.updateComment);
router.delete('/:id', protect, commentController.deleteComment);
router.post('/:id/replies', protect, addReplyValidation, commentController.addReply);
router.post('/:id/like', protect, commentController.toggleLike);

// Rutas de admin/moderador
router.post('/:id/pin', protect, authorize('admin', 'moderator'), commentController.togglePin);

export default router;

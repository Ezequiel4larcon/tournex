import express from 'express';
import { body, query } from 'express-validator';
import * as fileController from '../controllers/file.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload, multerErrorHandler } from '../middlewares/multerConfig.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validaciones
const uploadValidation = [
  body('relatedModel')
    .isIn(['Comment', 'User'])
    .withMessage('Related model must be either Comment or User'),
  body('relatedId')
    .isMongoId()
    .withMessage('Invalid related ID'),
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
router.get('/:id', fileController.getFile);
router.get('/related/:model/:id', fileController.getRelatedFiles);

// Rutas protegidas
router.post(
  '/upload',
  protect,
  upload.single('file'),
  multerErrorHandler,
  uploadValidation,
  fileController.uploadFile
);

router.post(
  '/upload-multiple',
  protect,
  upload.array('files', 10),
  multerErrorHandler,
  uploadValidation,
  fileController.uploadMultipleFiles
);

router.get('/user/my-files', protect, queryValidation, fileController.getMyFiles);
router.get('/user/stats', protect, fileController.getFileStats);
router.delete('/:id', protect, fileController.deleteFile);

export default router;

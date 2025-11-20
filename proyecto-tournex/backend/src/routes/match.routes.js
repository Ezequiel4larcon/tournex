import express from 'express';
import { body } from 'express-validator';
import * as matchController from '../controllers/match.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { upload } from '../middlewares/multerConfig.js';

const router = express.Router();

// Validaciones
const reportResultValidation = [
  body('winnerId').notEmpty().withMessage('Winner ID is required').isMongoId(),
  body('score.participant1Score').isInt({ min: 0 }).withMessage('Valid score required'),
  body('score.participant2Score').isInt({ min: 0 }).withMessage('Valid score required'),
  body('notes').optional().isLength({ max: 1000 }),
  validateRequest
];

const validateReportValidation = [
  body('validated').optional().isBoolean(),
  body('disputed').optional().isBoolean(),
  body('disputeReason').optional().isLength({ max: 500 }),
  validateRequest
];

const reassignRefereeValidation = [
  body('newRefereeId').notEmpty().withMessage('New referee ID required').isMongoId(),
  validateRequest
];

// Rutas públicas
router.get('/:id', matchController.getMatchById);
router.get('/:id/evidences', matchController.getMatchEvidences);

// Rutas protegidas - Referee
router.get(
  '/assigned',
  protect,
  authorize('referee'),
  matchController.getAssignedMatches
);

router.post(
  '/:id/report',
  protect,
  authorize('referee'),
  reportResultValidation,
  matchController.reportMatchResult
);

router.post(
  '/:id/evidence',
  protect,
  authorize('referee'),
  upload.single('evidence'),
  matchController.uploadEvidence
);

// Rutas protegidas - Admin/Referee
router.post(
  '/:id/validate',
  protect,
  authorize('admin', 'referee'),
  validateReportValidation,
  matchController.validateReport
);

// Rutas protegidas - Admin only
router.post(
  '/:id/reassign',
  protect,
  authorize('admin'),
  reassignRefereeValidation,
  matchController.reassignReferee
);

export default router;

import express from 'express';
import { body } from 'express-validator';
import * as matchController from '../controllers/match.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { isTournamentOwnerOrSuperAdmin } from '../middlewares/roleMiddleware.js';
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

// Rutas públicas
router.get('/:id', matchController.getMatchById);

// Rutas protegidas - Solo owner del torneo o super admin pueden validar resultados
router.post(
  '/:id/validate-result',
  protect,
  isTournamentOwnerOrSuperAdmin,
  reportResultValidation,
  matchController.validateMatchResult
);

export default router;

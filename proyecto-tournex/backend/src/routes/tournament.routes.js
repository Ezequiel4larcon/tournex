import express from 'express';
import { body, query } from 'express-validator';
import * as tournamentController from '../controllers/tournament.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validaciones
const createTournamentValidation = [
  body('name').trim().notEmpty().withMessage('Tournament name is required').isLength({ max: 100 }),
  body('game').trim().notEmpty().withMessage('Game name is required'),
  body('format').isIn(['single_elimination', 'double_elimination', 'round_robin', 'swiss']),
  body('maxParticipants').isInt({ min: 2 }).withMessage('Minimum 2 participants required'),
  body('registrationStartDate').isISO8601().withMessage('Valid registration start date required'),
  body('registrationEndDate').isISO8601().withMessage('Valid registration end date required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  validateRequest
];

const registerValidation = [
  body('participantType').isIn(['player', 'team']).withMessage('Invalid participant type'),
  body('teamId').optional().isMongoId().withMessage('Invalid team ID'),
  validateRequest
];

// Rutas públicas
router.get('/', tournamentController.getAllTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.get('/:id/matches', tournamentController.getTournamentMatches);

// Rutas protegidas
router.post(
  '/',
  protect,
  authorize('admin'),
  createTournamentValidation,
  tournamentController.createTournament
);

router.put(
  '/:id',
  protect,
  tournamentController.updateTournament
);

router.delete(
  '/:id',
  protect,
  tournamentController.deleteTournament
);

router.post(
  '/:id/register',
  protect,
  registerValidation,
  tournamentController.registerForTournament
);

router.post(
  '/:id/generate-bracket',
  protect,
  authorize('admin'),
  tournamentController.generateBracket
);

export default router;

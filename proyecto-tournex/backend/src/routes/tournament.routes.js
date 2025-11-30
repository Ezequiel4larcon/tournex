import express from 'express';
import { body, query } from 'express-validator';
import * as tournamentController from '../controllers/tournament.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { isSuperAdmin, isTournamentOwnerOrSuperAdmin } from '../middlewares/roleMiddleware.js';
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
  validateRequest
];

// Rutas públicas
router.get('/', tournamentController.getAllTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.get('/:id/matches', tournamentController.getTournamentMatches);

// Rutas protegidas - Cualquier usuario autenticado puede crear torneos
router.post(
  '/',
  protect,
  createTournamentValidation,
  tournamentController.createTournament
);

// Solo el owner del torneo o super admin pueden actualizar
router.put(
  '/:id',
  protect,
  isTournamentOwnerOrSuperAdmin,
  tournamentController.updateTournament
);

// Solo el owner del torneo o super admin pueden eliminar
router.delete(
  '/:id',
  protect,
  isTournamentOwnerOrSuperAdmin,
  tournamentController.deleteTournament
);

// Cualquier usuario autenticado puede unirse a un torneo
router.post(
  '/:id/register',
  protect,
  registerValidation,
  tournamentController.registerForTournament
);

// Owner del torneo o super admin pueden abrir inscripciones
router.post(
  '/:id/open-registration',
  protect,
  isTournamentOwnerOrSuperAdmin,
  tournamentController.openRegistration
);

// Owner del torneo o super admin pueden generar brackets
router.post(
  '/:id/generate-bracket',
  protect,
  isTournamentOwnerOrSuperAdmin,
  tournamentController.generateBracket
);

// Owner del torneo o super admin pueden iniciar el torneo
router.post(
  '/:id/start',
  protect,
  isTournamentOwnerOrSuperAdmin,
  tournamentController.startTournament
);

// Owner del torneo o super admin pueden banear participantes
router.post(
  '/:id/ban/:participantId',
  protect,
  isTournamentOwnerOrSuperAdmin,
  tournamentController.banParticipant
);

// Owner del torneo o super admin pueden generar la siguiente fase
router.post(
  '/:id/generate-next-phase',
  protect,
  isTournamentOwnerOrSuperAdmin,
  tournamentController.generateNextPhase
);

// Owner del torneo o super admin pueden finalizar el torneo
router.post(
  '/:id/finalize',
  protect,
  isTournamentOwnerOrSuperAdmin,
  tournamentController.finalizeTournament
);

export default router;

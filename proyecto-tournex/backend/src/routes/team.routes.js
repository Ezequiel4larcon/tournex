import express from 'express';
import { body } from 'express-validator';
import * as teamController from '../controllers/team.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { isSuperAdmin, isAdmin } from '../middlewares/roleMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validaciones
const createTeamValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Team name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Team name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  validateRequest
];

const respondToRequestValidation = [
  body('action')
    .isIn(['accepted', 'rejected']).withMessage('Action must be accepted or rejected'),
  validateRequest
];

// Rutas públicas
router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);

// Rutas protegidas
router.post(
  '/',
  protect,
  createTeamValidation,
  teamController.createTeam
);

router.put(
  '/:id',
  protect,
  teamController.updateTeam
);

router.delete(
  '/:id',
  protect,
  teamController.deleteTeam
);

router.post(
  '/:id/join',
  protect,
  teamController.requestJoinTeam
);

router.get(
  '/:id/requests',
  protect,
  teamController.getTeamRequests
);

router.post(
  '/requests/:requestId/respond',
  protect,
  respondToRequestValidation,
  teamController.respondToRequest
);

router.delete(
  '/:id/members/:memberId',
  protect,
  teamController.kickMember
);

router.post(
  '/:id/leave',
  protect,
  teamController.leaveTeam
);

// Rutas de moderación - Solo super admin
router.delete(
  '/:id/moderate',
  protect,
  isSuperAdmin,
  teamController.deleteTeam
);

router.put(
  '/:id/moderate',
  protect,
  isSuperAdmin,
  teamController.updateTeam
);

export default router;

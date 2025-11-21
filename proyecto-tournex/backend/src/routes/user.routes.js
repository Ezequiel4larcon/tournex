import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { isSuperAdmin } from '../middlewares/roleMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validaciones
const updateRoleValidation = [
  body('role')
    .isIn(['player', 'super_admin'])
    .withMessage('Rol inválido'),
  validateRequest
];

// Todas las rutas requieren super admin
router.use(protect, isSuperAdmin);

// Obtener todos los usuarios con filtros
router.get('/', userController.getAllUsers);

// Obtener estadísticas de usuarios
router.get('/stats', userController.getUserStats);

// Obtener usuario específico
router.get('/:id', userController.getUserById);

// Cambiar rol de usuario
router.put('/:id/role', updateRoleValidation, userController.updateUserRole);

// Suspender/activar usuario
router.patch('/:id/toggle-status', userController.toggleUserStatus);

// Eliminar usuario
router.delete('/:id', userController.deleteUser);

export default router;

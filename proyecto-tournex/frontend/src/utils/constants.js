/**
 * Roles de usuario del sistema de torneos
 */
export const USER_ROLES = {
  PLAYER: 'player',
  SUPER_ADMIN: 'super_admin',
};

/**
 * Estados de torneo
 */
export const TOURNAMENT_STATUS = {
  PENDING: 'pending',
  REGISTRATION_OPEN: 'registration_open',
  REGISTRATION_CLOSED: 'registration_closed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/**
 * Formatos de torneo
 */
export const TOURNAMENT_FORMATS = {
  SINGLE_ELIMINATION: 'single_elimination',
};

/**
 * Tamaño máximo de archivo (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Tipos de archivo permitidos
 */
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf'
];

/**
 * Límites de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu internet.',
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no existe.',
  SERVER_ERROR: 'Error del servidor. Intenta nuevamente más tarde.',
  VALIDATION_ERROR: 'Error de validación. Verifica los datos ingresados.'
};

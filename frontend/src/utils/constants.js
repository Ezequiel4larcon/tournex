/**
 * Categorías disponibles para los comentarios
 */
export const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'sports', label: 'Deportes' },
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'education', label: 'Educación' },
  { value: 'other', label: 'Otro' }
];

/**
 * Roles de usuario
 */
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
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

import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/errorHandler.js';
import User from '../models/User.js';

/**
 * Middleware para proteger rutas que requieren autenticación
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Extraer token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token provided');
    }

    // Verificar token
    const decoded = verifyToken(token);

    // Obtener usuario del token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'User account is inactive');
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar roles de usuario
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to access this route');
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación (no lanza error si no hay token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Si hay error con el token, simplemente continuar sin usuario
    next();
  }
};
    

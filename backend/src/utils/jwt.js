import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos del usuario a incluir en el token
 * @returns {String} Token JWT
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

/**
 * Verifica y decodifica un token JWT
 * @param {String} token - Token JWT a verificar
 * @returns {Object} Payload decodificado
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decodifica un token sin verificar (útil para debugging)
 * @param {String} token - Token JWT a decodificar
 * @returns {Object} Payload decodificado
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

import bcrypt from 'bcryptjs';

/**
 * Hash de una contraseña
 * @param {String} password - Contraseña en texto plano
 * @returns {Promise<String>} Contraseña hasheada
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compara una contraseña en texto plano con un hash
 * @param {String} password - Contraseña en texto plano
 * @param {String} hashedPassword - Contraseña hasheada
 * @returns {Promise<Boolean>} True si coinciden, false si no
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

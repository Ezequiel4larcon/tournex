/**
 * Validar email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar contraseña (mínimo 6 caracteres)
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validar nombre de usuario (3-30 caracteres)
 */
export const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 30;
};

/**
 * Validar título de comentario (3-200 caracteres)
 */
export const validateTitle = (title) => {
  return title && title.trim().length >= 3 && title.trim().length <= 200;
};

/**
 * Validar contenido de comentario (10-5000 caracteres)
 */
export const validateContent = (content) => {
  return content && content.trim().length >= 10 && content.trim().length <= 5000;
};

/**
 * Validar URL
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validar tamaño de archivo
 */
export const validateFileSize = (file, maxSize = 5242880) => {
  return file && file.size <= maxSize;
};

/**
 * Validar tipo de archivo
 */
export const validateFileType = (file, allowedTypes) => {
  return file && allowedTypes.includes(file.type);
};

/**
 * Formatear errores de validación del backend
 */
export const formatValidationErrors = (errors) => {
  if (!errors || !Array.isArray(errors)) return {};
  
  return errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {});
};

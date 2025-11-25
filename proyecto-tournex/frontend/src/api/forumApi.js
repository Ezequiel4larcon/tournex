const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Obtener token del localStorage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Cliente HTTP genérico
 */
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Si el body no es FormData, convertirlo a JSON
  if (config.body && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // Si es FormData, eliminar el Content-Type para que el navegador lo establezca
  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        errors: data.errors || null
      };
    }

    return data;
  } catch (error) {
    // Solo redirigir al login si hay un 401 Y ya tenemos un token almacenado
    // Esto significa que el token expiró, no que las credenciales son incorrectas
    if (error.status === 401 && token && !endpoint.includes('/auth/login')) {
      // Si es 401 y NO es en la ruta de login, limpiar token y redirigir
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error;
  }
};

/**
 * API de Autenticación
 */
export const authAPI = {
  register: (userData) => fetchAPI('/auth/register', {
    method: 'POST',
    body: userData,
  }),

  login: (credentials) => fetchAPI('/auth/login', {
    method: 'POST',
    body: credentials,
  }),

  getProfile: () => fetchAPI('/auth/profile'),

  updateProfile: (userData) => fetchAPI('/auth/profile', {
    method: 'PUT',
    body: userData,
  }),

  changePassword: (passwords) => fetchAPI('/auth/change-password', {
    method: 'PUT',
    body: passwords,
  }),

  logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
};

/**
 * API de Comentarios
 */
export const commentAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/comments${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => fetchAPI(`/comments/${id}`),

  create: (commentData) => fetchAPI('/comments', {
    method: 'POST',
    body: commentData,
  }),

  update: (id, commentData) => fetchAPI(`/comments/${id}`, {
    method: 'PUT',
    body: commentData,
  }),

  delete: (id) => fetchAPI(`/comments/${id}`, {
    method: 'DELETE',
  }),

  addReply: (id, replyData) => fetchAPI(`/comments/${id}/replies`, {
    method: 'POST',
    body: replyData,
  }),

  toggleLike: (id) => fetchAPI(`/comments/${id}/like`, {
    method: 'POST',
  }),

  togglePin: (id) => fetchAPI(`/comments/${id}/pin`, {
    method: 'POST',
  }),
};

/**
 * API de Archivos
 */
export const fileAPI = {
  upload: (file, relatedModel, relatedId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('relatedModel', relatedModel);
    formData.append('relatedId', relatedId);

    return fetchAPI('/files/upload', {
      method: 'POST',
      body: formData,
    });
  },

  uploadMultiple: (files, relatedModel, relatedId) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('relatedModel', relatedModel);
    formData.append('relatedId', relatedId);

    return fetchAPI('/files/upload-multiple', {
      method: 'POST',
      body: formData,
    });
  },

  getById: (id) => fetchAPI(`/files/${id}`),

  getMyFiles: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/files/user/my-files${queryString ? `?${queryString}` : ''}`);
  },

  getRelated: (model, id) => fetchAPI(`/files/related/${model}/${id}`),

  delete: (id) => fetchAPI(`/files/${id}`, {
    method: 'DELETE',
  }),

  getStats: () => fetchAPI('/files/user/stats'),
};

export default {
  auth: authAPI,
  comment: commentAPI,
  file: fileAPI,
};

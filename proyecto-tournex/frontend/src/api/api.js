import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las requests
api.interceptors.request.use(
  (config) => {
    // No enviar token en rutas de autenticación
    const isAuthRoute = config.url?.includes('/auth/login') || 
                       config.url?.includes('/auth/register');
    
    if (!isAuthRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir si es 401 y NO es una ruta de login/register
    const isAuthRoute = error.config?.url?.includes('/auth/login') || 
                       error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  logout: () => api.post('/auth/logout'),
};

// Tournaments API
export const tournamentsAPI = {
  getAll: (params) => api.get('/tournaments', { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  register: (id, data) => api.post(`/tournaments/${id}/register`, data),
  openRegistration: (id, data) => api.post(`/tournaments/${id}/open-registration`, data),
  generateBracket: (id) => api.post(`/tournaments/${id}/generate-bracket`),
  start: (id) => api.post(`/tournaments/${id}/start`),
  getMatches: (id) => api.get(`/tournaments/${id}/matches`),
  banParticipant: (id, participantId) => api.post(`/tournaments/${id}/ban/${participantId}`),
  generateNextPhase: (id, round) => api.post(`/tournaments/${id}/generate-next-phase`, { round }),
  finalize: (id, round) => api.post(`/tournaments/${id}/finalize`, { round }),
};

// Matches API
export const matchesAPI = {
  getAssigned: () => api.get('/matches/assigned'),
  getById: (id) => api.get(`/matches/${id}`),
  report: (id, data) => api.post(`/matches/${id}/report`, data),
  validate: (id, data) => api.post(`/matches/${id}/validate-result`, data),
  edit: (id, data) => api.put(`/matches/${id}/edit-result`, data),
  setLive: (id) => api.post(`/matches/${id}/set-live`),
};

export default api;

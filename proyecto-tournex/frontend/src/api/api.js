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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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

// Tournaments API
export const tournamentsAPI = {
  getAll: (params) => api.get('/tournaments', { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  register: (id, data) => api.post(`/tournaments/${id}/register`, data),
  generateBracket: (id) => api.post(`/tournaments/${id}/generate-bracket`),
  getMatches: (id) => api.get(`/tournaments/${id}/matches`),
};

// Teams API
export const teamsAPI = {
  getAll: (params) => api.get('/teams', { params }),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  join: (id) => api.post(`/teams/${id}/join`),
  getRequests: (id) => api.get(`/teams/${id}/requests`),
  respondToRequest: (requestId, action) => api.post(`/teams/requests/${requestId}/respond`, { action }),
  kickMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  leave: (id) => api.post(`/teams/${id}/leave`),
};

// Matches API
export const matchesAPI = {
  getAssigned: () => api.get('/matches/assigned'),
  getById: (id) => api.get(`/matches/${id}`),
  report: (id, data) => api.post(`/matches/${id}/report`, data),
  validate: (id, data) => api.post(`/matches/${id}/validate`, data),
  uploadEvidence: (id, formData) => api.post(`/matches/${id}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getEvidences: (id) => api.get(`/matches/${id}/evidences`),
  reassign: (id, data) => api.post(`/matches/${id}/reassign`, data),
};

// Messages API
export const messagesAPI = {
  send: (data) => api.post('/messages', data),
  getByContext: (contextType, contextId, params) => api.get(`/messages/${contextType}/${contextId}`, { params }),
  edit: (id, data) => api.put(`/messages/${id}`, data),
  delete: (id) => api.delete(`/messages/${id}`),
  getActiveChats: () => api.get('/messages/chats'),
};

export default api;

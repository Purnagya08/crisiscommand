import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export const crisisApi = {
  getAll: (params = {}) => api.get('/api/crises', { params }),
  getById: (id) => api.get(`/api/crises/${id}`),
  create: (data) => api.post('/api/crises', data),
  update: (id, data) => api.put(`/api/crises/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/crises/${id}/status`, { status }),
  addTimeline: (id, data) => api.post(`/api/crises/${id}/timeline`, data),
  delete: (id) => api.delete(`/api/crises/${id}`),
  getEnums: () => api.get('/api/crises/meta/enums')
};

export const aiApi = {
  analyze: (crisisId) => api.post(`/api/ai/analyze/${crisisId}`),
  recommendResources: (data) => api.post('/api/ai/recommend-resources', data),
  generateReport: (crisisId) => api.post('/api/ai/generate-report', { crisisId }),
  chat: (message, context) => api.post('/api/ai/chat', { message, context }),
  prioritize: () => api.post('/api/ai/prioritize'),
  getLogs: () => api.get('/api/ai/logs')
};

export const resourceApi = {
  getAll: (params = {}) => api.get('/api/resources', { params }),
  getById: (id) => api.get(`/api/resources/${id}`),
  create: (data) => api.post('/api/resources', data),
  update: (id, data) => api.put(`/api/resources/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/resources/${id}/status`, { status }),
  getTypes: () => api.get('/api/resources/meta/types')
};

export const analyticsApi = {
  getOverview: () => api.get('/api/analytics/overview'),
  getAlerts: () => api.get('/api/analytics/alerts'),
  markAlertRead: (id) => api.patch(`/api/analytics/alerts/${id}/read`),
  getTimeline: () => api.get('/api/analytics/timeline')
};

export const healthApi = {
  check: () => api.get('/health')
};

export default api;

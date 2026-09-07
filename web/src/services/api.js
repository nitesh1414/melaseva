import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Complaint API
export const complaintAPI = {
  create: (data) => api.post('/complaints', data),
  list: (params) => api.get('/complaints', { params }),
  get: (id) => api.get(`/complaints/${id}`),
  assign: (id, data) => api.put(`/complaints/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  resolve: (id, data) => api.put(`/complaints/${id}/resolve`, data),
  track: (params) => api.get('/complaints/track', { params }),
  dashboard: (eventId, params) => api.get(`/complaints/dashboard/${eventId}`, { params }),
  map: (eventId, params) => api.get(`/complaints/map/${eventId}`, { params }),
};

// Asset API
export const assetAPI = {
  create: (data) => api.post('/assets', data),
  list: (params) => api.get('/assets', { params }),
  get: (id) => api.get(`/assets/${id}`),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  map: (eventId, params) => api.get(`/assets/map/${eventId}`, { params }),
  nearby: (params) => api.get('/assets/nearby', { params }),
};

// User API
export const userAPI = {
  create: (data) => api.post('/users', data),
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id, data) => api.put(`/users/${id}/reset-password`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Event API
export const eventAPI = {
  create: (data) => api.post('/events', data),
  list: (params) => api.get('/events', { params }),
  get: (id) => api.get(`/events/${id}`),
  update: (id, data) => api.put(`/events/${id}`, data),
};

// Facility API
export const facilityAPI = {
  create: (data) => api.post('/facilities', data),
  list: (params) => api.get('/facilities', { params }),
  get: (id) => api.get(`/facilities/${id}`),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  nearby: (params) => api.get('/facilities/nearby', { params }),
  map: (eventId, params) => api.get(`/facilities/map/${eventId}`, { params }),
};

// QR Code API
export const qrCodeAPI = {
  generate: (data) => api.post('/qr-codes/generate', data),
  bulkGenerate: (data) => api.post('/qr-codes/bulk-generate', data),
  list: (params) => api.get('/qr-codes', { params }),
  scan: (code) => api.get(`/qr-codes/scan/${code}`),
};

// Masters API
export const mastersAPI = {
  // Departments
  createDepartment: (data) => api.post('/masters/departments', data),
  listDepartments: (params) => api.get('/masters/departments', { params }),
  updateDepartment: (id, data) => api.put(`/masters/departments/${id}`, data),
  
  // Complaint Categories
  createCategory: (data) => api.post('/masters/complaint-categories', data),
  listCategories: (params) => api.get('/masters/complaint-categories', { params }),
  
  // SLA Rules
  createSLARule: (data) => api.post('/masters/sla-rules', data),
  listSLARules: (params) => api.get('/masters/sla-rules', { params }),
  
  // Zones
  createZone: (data) => api.post('/masters/zones', data),
  listZones: (params) => api.get('/masters/zones', { params }),
  
  // Sectors
  createSector: (data) => api.post('/masters/sectors', data),
  listSectors: (params) => api.get('/masters/sectors', { params }),
  
  // Roads
  createRoad: (data) => api.post('/masters/roads', data),
  listRoads: (params) => api.get('/masters/roads', { params }),
  
  // Audit Logs
  listAuditLogs: (params) => api.get('/masters/audit-logs', { params }),
  
  // Notifications
  listNotifications: (params) => api.get('/masters/notifications', { params }),
  markNotificationRead: (id) => api.put(`/masters/notifications/${id}/read`),
  
  // SMS Templates
  createSMSTemplate: (data) => api.post('/masters/sms-templates', data),
  listSMSTemplates: (params) => api.get('/masters/sms-templates', { params }),
  
  // Settings
  getSettings: (params) => api.get('/masters/settings', { params }),
  updateSettings: (data) => api.put('/masters/settings', data),
};

// Feedback API
export const feedbackAPI = {
  create: (data) => api.post('/feedback', data),
  list: (params) => api.get('/feedback', { params }),
};

export default api;

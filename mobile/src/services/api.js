import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ ? 'http://10.0.2.2:5000/api' : 'https://api.melaseva.gov.in/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

export const complaintAPI = {
  list: (params) => api.get('/complaints', { params }),
  get: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  resolve: (id, data) => api.put(`/complaints/${id}/resolve`, data),
  track: (params) => api.get('/complaints/track', { params }),
  dashboard: (eventId) => api.get(`/complaints/dashboard/${eventId}`),
};

export const assetAPI = {
  list: (params) => api.get('/assets', { params }),
  get: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  nearby: (params) => api.get('/assets/nearby', { params }),
};

export const facilityAPI = {
  nearby: (params) => api.get('/facilities/nearby', { params }),
  map: (eventId, params) => api.get(`/facilities/map/${eventId}`, { params }),
};

export const qrCodeAPI = {
  scan: (code) => api.get(`/qr-codes/scan/${code}`),
};

export const feedbackAPI = {
  create: (data) => api.post('/feedback', data),
};

export default api;

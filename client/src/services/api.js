import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Reports
export const getReports = (params) => API.get('/reports', { params });
export const getReportById = (id) => API.get(`/reports/${id}`);
export const createReport = (data) => API.post('/reports', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateReportStatus = (id, data) => API.put(`/reports/${id}/status`, data);
export const deleteReport = (id) => API.delete(`/reports/${id}`);
export const getReportStats = () => API.get('/reports/stats');

// Admin
export const getUsers = () => API.get('/admin/users');
export const updateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const assignReport = (id, authorityId) => API.put(`/admin/reports/${id}/assign`, { authorityId });
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');

import axios from 'axios';

// ✅ FIXED: Remove localhost for deployment
// In development: Vite proxy handles /api -> localhost:5000
// In production: Same domain, so relative paths work
const API_URL = ''; // Empty string for relative paths

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Optional: if using cookies/sessions
});

// Add token to requests
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

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
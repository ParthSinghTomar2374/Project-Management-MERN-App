import axios from 'axios';

// Use environment variable in production, fall back to localhost for local dev
// Use environment variable in production, fall back to relative /api or localhost for dev
const VITE_API_URL = import.meta.env.VITE_API_URL;
const API_URL = VITE_API_URL 
  ? (VITE_API_URL.endsWith('/api') ? VITE_API_URL : `${VITE_API_URL.replace(/\/$/, '')}/api`)
  : (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');


const api = axios.create({
  baseURL: API_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch {
    // Invalid JSON in localStorage — ignore
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 Unauthorized globally — clear stale session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/signup')) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

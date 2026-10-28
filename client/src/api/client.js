import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to inject bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('daytrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('daytrack_token');
        localStorage.removeItem('daytrack_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

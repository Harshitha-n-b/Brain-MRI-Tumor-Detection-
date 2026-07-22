import axios from 'axios';

const getBaseURL = () => {
  // If running on Vite dev server (port 5173), direct requests to Flask backend (port 5000)
  if (window.location.port === '5173' || window.location.hostname === 'localhost' && window.location.port !== '5000') {
    return 'http://localhost:5000';
  }
  return ''; // Relative paths in production
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor to inject JWT token automatically into headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are not on the login/register pages, redirect to login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/' && currentPath !== '/about' && currentPath !== '/contact') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

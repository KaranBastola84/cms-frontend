import axios from 'axios';

// API configuration
export const APP_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL,  
  // Request headers
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance with base configuration
const apiInstance = axios.create({
  baseURL: APP_CONFIG.baseURL,
  timeout: 10000,
  headers: APP_CONFIG.headers,
});

// Request interceptor to add auth token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      //redirect to home page
      window.location.href = '/';
    } else if (error.response?.status === 403) {
      console.error('Forbidden: You do not have permission');
    } else if (error.response?.status >= 500) {
      console.error('Server error. Please try again later');
    } else if (!error.response) {
      console.error('Network error. Check your connection');
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
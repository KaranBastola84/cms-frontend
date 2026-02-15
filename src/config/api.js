import axios from 'axios';

// API configuration with fallback
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

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and token refresh
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration with refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token, redirect to login
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${APP_CONFIG.baseURL}/api/Auth/refresh`,
          {
            access: localStorage.getItem('accessToken'),
            refresh: refreshToken,
          }
        );

        if (response.data.isSuccess) {
          const { access, refresh } = response.data.result;
          
          // Update tokens
          localStorage.setItem('accessToken', access);
          localStorage.setItem('refreshToken', refresh);
          
          // Update default header
          apiInstance.defaults.headers.common['Authorization'] = 'Bearer ' + access;
          originalRequest.headers['Authorization'] = 'Bearer ' + access;
          
          processQueue(null, access);
          isRefreshing = false;
          
          // Retry the original request
          return apiInstance(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear all auth data and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
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
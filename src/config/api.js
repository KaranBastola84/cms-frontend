import axios from "axios";
import toast from "react-hot-toast";
import APP_CONFIG from "./appConfig";
import { extractApiErrorMessage, isPublicEndpoint } from "../utils/helpers";

// Create axios instance with base configuration
const apiInstance = axios.create({
  baseURL: APP_CONFIG.baseURL,
  timeout: 15000,
  headers: APP_CONFIG.headers,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, undefined);

// Response interceptor to handle common errors and token refresh
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const resolvedErrorMessage = extractApiErrorMessage(
      error,
      error?.message || "Request failed. Please try again.",
    );

    // Normalize errors so callers that throw/read response.data still get a usable message.
    if (error.response?.data && typeof error.response.data === "object") {
      error.response.data.message = resolvedErrorMessage;
    }
    error.message = resolvedErrorMessage;

    // Skip token refresh logic for login and public endpoints
    const isLoginRequest =
      originalRequest.url?.includes("/api/Auth/login") ||
      originalRequest.url?.includes("/api/Auth/student-login");
    const isRefreshRequest = originalRequest.url?.includes("/api/Auth/refresh");

    // Handle token expiration with refresh (skip for login/refresh endpoints)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      // For public endpoints, retry without auth instead of session-expired redirect
      if (isPublicEndpoint(originalRequest.url)) {
        originalRequest._retry = true;
        if (originalRequest.headers) {
          delete originalRequest.headers["Authorization"];
        }
        return apiInstance(originalRequest);
      }
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token, redirect to login
        isRefreshing = false;
        localStorage.clear();
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${APP_CONFIG.baseURL}/api/Auth/refresh`,
          {
            access: localStorage.getItem("accessToken"),
            refresh: refreshToken,
          },
        );

        if (response.data.isSuccess) {
          const { access, refresh } = response.data.result;

          // Update tokens
          localStorage.setItem("accessToken", access);
          localStorage.setItem("refreshToken", refresh);

          // Update default header
          apiInstance.defaults.headers.common["Authorization"] =
            "Bearer " + access;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = "Bearer " + access;

          processQueue(null, access);
          isRefreshing = false;

          // Retry the original request
          return apiInstance(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear all auth data and redirect to login
        localStorage.clear();
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 403) {
      toast.error(resolvedErrorMessage);
    } else if (error.response?.status >= 500) {
      toast.error(resolvedErrorMessage);
    } else if (!error.response) {
      toast.error("Network error. Please check your connection");
    }

    return Promise.reject(error);
  },
);

export default apiInstance;

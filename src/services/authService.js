import apiInstance from "../config/api";

const authService = {
  /**
   * Login user with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise} Response with user data and tokens
   */
  login: async (username, password) => {
    try {
      const response = await apiInstance.post("/api/Auth/login", {
        username,
        password,
      });

      if (response.data.isSuccess) {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", response.data.result.access);
        localStorage.setItem("refreshToken", response.data.result.refresh);
        localStorage.setItem("authToken", response.data.result.access); // For compatibility with api.js interceptor
        
        // Store user data
        localStorage.setItem("userData", JSON.stringify(response.data.result.user));
        
        return {
          success: true,
          data: response.data.result,
        };
      } else {
        return {
          success: false,
          message: response.data.errorMessage.join(", ") || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.errorMessage?.join(", ") || 
                 error.response?.data?.message || 
                 "An error occurred during login",
      };
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User data or null
   */
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  },

  /**
   * Get access token
   * @returns {string|null} Access token or null
   */
  getAccessToken: () => {
    return localStorage.getItem("accessToken");
  },

  /**
   * Get refresh token
   * @returns {string|null} Refresh token or null
   */
  getRefreshToken: () => {
    return localStorage.getItem("refreshToken");
  },
};

export default authService;

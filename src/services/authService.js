import apiInstance from "../config/api";

/**
 * Helper function to decode JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null
 */
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // Check if token expires in less than 1 minute
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const buffer = 60 * 1000; // 1 minute buffer
  
  return expirationTime - currentTime < buffer;
};

const authService = {
  /**
   * Login user with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise} Response with user data and tokens
   * @throws {Error} If login fails
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
        
        // Store user data
        localStorage.setItem("userData", JSON.stringify(response.data.result.user));
        
        return {
          success: true,
          data: response.data.result,
        };
      } else {
        throw new Error(response.data.errorMessage?.join(", ") || "Login failed");
      }
    } catch (error) {
      // Handle specific error scenarios
      let errorMessage = "An error occurred during login";
      
      if (error.response?.status === 401) {
        // Check if it's an inactive account
        const errorMessages = error.response?.data?.errorMessage;
        if (errorMessages && errorMessages.some(msg => msg.toLowerCase().includes("inactive"))) {
          errorMessage = "Your account is inactive. Please contact the administrator.";
        } else {
          errorMessage = error.response?.data?.errorMessage?.join(", ") || "Invalid username or password";
        }
      } else if (error.response?.data?.errorMessage) {
        errorMessage = error.response.data.errorMessage.join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Logout user and call logout API
   */
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      // Call logout API if refresh token exists
      if (refreshToken) {
        await apiInstance.post("/api/Auth/logout", {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear all local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      
      // Redirect to login
      window.location.href = "/login";
    }
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
   * Check if user is authenticated with valid token
   * @returns {boolean} True if user has valid, non-expired token
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return false;
    
    // Check if token is expired
    return !isTokenExpired(token);
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

  /**
   * Check if access token is expired
   * @returns {boolean} True if token is expired
   */
  isAccessTokenExpired: () => {
    const token = localStorage.getItem("accessToken");
    return isTokenExpired(token);
  },

  /**
   * Update user data in localStorage
   * @param {Object} userData - Updated user data
   */
  updateUser: (userData) => {
    try {
      localStorage.setItem("userData", JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Error updating user data:", error);
      return false;
    }
  },
};

export default authService;

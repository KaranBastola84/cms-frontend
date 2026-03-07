import apiInstance from "../config/api";

/**
 * Helper function to decode JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null
 */
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
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

const normalizeErrorMessages = (errorData) => {
  if (!errorData) return [];

  if (Array.isArray(errorData.errorMessage)) {
    return errorData.errorMessage.filter(Boolean);
  }

  if (typeof errorData.errorMessage === "string") {
    return [errorData.errorMessage];
  }

  if (typeof errorData.message === "string") {
    return [errorData.message];
  }

  if (typeof errorData.title === "string") {
    return [errorData.title];
  }

  return [];
};

const persistAuthResult = (result) => {
  localStorage.setItem("accessToken", result.access);
  localStorage.setItem("refreshToken", result.refresh);
  localStorage.setItem("userData", JSON.stringify(result.user));
};

const parseApiErrorMessage = (error, fallbackMessage) => {
  const messages = normalizeErrorMessages(error?.response?.data);
  if (messages.length > 0) {
    const merged = messages.join(", ");
    const lowered = merged.toLowerCase();

    if (lowered.includes("pending payment")) {
      return "Enrollment is pending payment";
    }
    if (
      lowered.includes("inactive") ||
      lowered.includes("suspended") ||
      lowered.includes("dropped")
    ) {
      return "Account is inactive";
    }
    if (lowered.includes("invalid") && lowered.includes("password")) {
      return "Invalid email or password";
    }

    return merged;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};

const loginWithStandardEndpoint = async (username, password) => {
  const response = await apiInstance.post("/api/Auth/login", {
    username,
    password,
  });

  if (!response.data.isSuccess) {
    throw new Error(
      normalizeErrorMessages(response.data).join(", ") || "Login failed",
    );
  }

  return response.data.result;
};

const loginWithStudentEndpoint = async (email, password) => {
  const response = await apiInstance.post("/api/Auth/student-login", {
    email,
    password,
  });

  if (!response.data.isSuccess) {
    throw new Error(
      normalizeErrorMessages(response.data).join(", ") || "Login failed",
    );
  }

  return response.data.result;
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
      const identifier = String(username || "").trim();
      const authResult = await loginWithStandardEndpoint(identifier, password);

      persistAuthResult(authResult);

      return {
        success: true,
        data: authResult,
      };
    } catch (error) {
      throw new Error(
        parseApiErrorMessage(error, "An error occurred during login"),
      );
    }
  },

  /**
   * Login student with email and password
   * @param {string} email - Student email
   * @param {string} password - Student password
   * @returns {Promise} Response with user data and tokens
   */
  studentLogin: async (email, password) => {
    try {
      const normalizedEmail = String(email || "").trim();
      const authResult = await loginWithStudentEndpoint(
        normalizedEmail,
        password,
      );

      persistAuthResult(authResult);

      return {
        success: true,
        data: authResult,
      };
    } catch (error) {
      throw new Error(
        parseApiErrorMessage(error, "An error occurred during student login"),
      );
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

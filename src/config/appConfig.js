// API configuration — single source of truth for base URL and default headers.
// Kept in its own file to avoid circular dependencies between api.js and helpers.js.

const APP_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
};

export default APP_CONFIG;

// API configuration — single source of truth for base URL and default headers.
// Kept in its own file to avoid circular dependencies between api.js and helpers.js.

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const hasConfiguredBaseUrl =
  rawBaseUrl.length > 0 &&
  rawBaseUrl !== "http://" &&
  rawBaseUrl !== "https://";

// In production, default to same-origin requests when no base URL is configured.
const baseURL = hasConfiguredBaseUrl
  ? rawBaseUrl.replace(/\/+$/, "")
  : import.meta.env.DEV
    ? "http://localhost:5000"
    : "";

const APP_CONFIG = {
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
};

export default APP_CONFIG;

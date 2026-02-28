import APP_CONFIG from "../config/appConfig";

/**
 * Public endpoint patterns — these don't require authentication.
 * If a stale token causes a 401 on these, we retry without the token
 * instead of triggering session-expired redirect.
 */
const PUBLIC_ENDPOINT_PATTERNS = [
  /^\/api\/Product(\/|$|\?)/i,
  /^\/api\/Order$/i, // POST create order
  /^\/api\/Order\/\d+$/i, // GET order by ID (order confirmation)
  /^\/api\/Inquiry/i,
];

/**
 * Check if a URL matches a public (no-auth) endpoint
 * @param {string} url - Request URL to check
 * @returns {boolean}
 */
export const isPublicEndpoint = (url) => {
  if (!url) return false;
  try {
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    return PUBLIC_ENDPOINT_PATTERNS.some((pattern) => pattern.test(path));
  } catch {
    return PUBLIC_ENDPOINT_PATTERNS.some((pattern) => pattern.test(url));
  }
};

/**
 * Get full image URL from a relative path returned by the API
 * @param {string} relativePath - Relative image path (e.g., "/Uploads/Products/image.jpg")
 * @returns {string|null} Full image URL
 */
export const getImageUrl = (relativePath) => {
  if (!relativePath) return null;

  // If already a full URL, return as-is
  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://")
  ) {
    return relativePath;
  }

  // Remove leading slash to avoid double slashes
  const cleanPath = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;

  return `${APP_CONFIG.baseURL}/${cleanPath}`;
};

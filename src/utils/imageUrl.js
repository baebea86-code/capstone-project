/**
 * getImageUrl(src)
 *
 * Resolves an image value stored in the database into a URL the browser can
 * fetch.  Two cases are handled:
 *
 *  1. Uploaded file — stored as a relative path like "/uploads/filename.png".
 *     These are served by the Express static middleware, so we prepend the
 *     API origin (e.g. "http://localhost:5000").
 *
 *  2. External URL — already starts with "http" / "https", so it is returned
 *     unchanged.
 *
 * The API origin is taken from the VITE_API_URL env variable (minus the "/api"
 * suffix) so it automatically works in every environment without hardcoding
 * "localhost:5000".
 */

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  .replace(/\/api\/?$/, ''); // strip trailing "/api" to get the server origin

/**
 * @param {string | undefined | null} src - The image value from the database.
 * @param {string} [fallback] - Optional fallback URL if src is empty.
 * @returns {string}
 */
export function getImageUrl(src, fallback = '') {
  if (!src) return fallback;
  // Relative upload path → prefix with server origin
  if (src.startsWith('/uploads')) return `${API_BASE}${src}`;
  // Already a full URL
  return src;
}

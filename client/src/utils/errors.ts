/**
 * Sanitizes error messages to prevent information leakage
 *
 * @param err - The error object to sanitize
 * @returns A safe, user-friendly error message
 */
export function sanitizeError(err: unknown): string {
  if (err instanceof Error) {
    const message = err.message.toLowerCase();

    // Network errors
    if (message.includes("network") || message.includes("timeout") || message.includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }

    // Authentication errors
    if (message.includes("401") || message.includes("unauthorized")) {
      return "Authentication required. Please log in again.";
    }

    // Permission errors
    if (message.includes("403") || message.includes("forbidden")) {
      return "You don't have permission to perform this action.";
    }

    // Not found errors
    if (message.includes("404") || message.includes("not found")) {
      return "The requested resource was not found.";
    }

    // Server errors
    if (message.includes("500") || message.includes("502") || message.includes("503")) {
      return "Server error. Please try again later.";
    }

    // Generic fallback - don't expose raw error messages
    return "An error occurred. Please try again.";
  }

  return "An unexpected error occurred.";
}

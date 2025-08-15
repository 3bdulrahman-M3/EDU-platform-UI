// Main API exports
export { authAPI } from "./authAPI";
export { instructorAPI } from "./instructorAPI";
export { studentAPI } from "./studentAPI";
export { coursesAPI } from "./coursesAPI";
export { sessionAPI } from "./sessionAPI";

// Configuration and utilities
export { api, API_BASE_URL } from "./apiConfig";
export {
  getCurrentUserFromStorage,
  setAuthToken,
  setRefreshToken,
  getAuthToken,
  isAuthenticated,
  getUser,
  setUser,
} from "./apiUtils";

// Default export for backward compatibility
import { api } from "./apiConfig";
export default api;

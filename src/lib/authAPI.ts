import { User } from "@/types";
import { api, API_BASE_URL } from "./apiConfig";
import { RateLimiter } from "./security";

// Rate limiter for auth endpoints
const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Auth API functions
export const authAPI = {
  // Register a new user
  register: async (userData: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    username: string;
    role: string;
  }): Promise<{
    data: {
      user: User;
      tokens: { access: string; refresh: string };
    };
  }> => {
    // Rate limiting check
    if (!authRateLimiter.isAllowed(`register_${userData.email}`)) {
      throw new Error(
        "Too many registration attempts. Please try again later."
      );
    }

    console.log("=== REGISTER API DEBUG ===");
    console.log("Sending registration data:", userData);
    console.log("Role being sent:", userData.role);
    console.log("==========================");

    const response = await api.post("/auth/register/", userData);

    console.log("=== REGISTER RESPONSE DEBUG ===");
    console.log("Full response:", response);
    console.log("Response data:", response.data);
    console.log("User data in response:", response.data.user);
    console.log("User role in response:", response.data.user?.role);
    console.log("==============================");

    // Reset rate limiter on successful registration
    authRateLimiter.reset(`register_${userData.email}`);

    return response;
  },

  // Google authentication
  googleAuth: async (
    credential: string
  ): Promise<{
    data: {
      user: User;
      tokens: { access: string; refresh: string };
      isNewUser?: boolean;
    };
  }> => {
    // Rate limiting check for Google auth
    if (!authRateLimiter.isAllowed("google_auth")) {
      throw new Error(
        "Too many Google authentication attempts. Please try again later."
      );
    }

    console.log("=== GOOGLE AUTH API DEBUG ===");
    console.log("Sending Google credential");
    console.log("API URL:", API_BASE_URL);
    console.log("Full endpoint:", `${API_BASE_URL}/auth/google/`);
    console.log("Credential length:", credential.length);

    try {
      // Backend expects 'token' field, not 'credential'
      const response = await api.post("/auth/google/", { token: credential });

      console.log("=== GOOGLE AUTH RESPONSE DEBUG ===");
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("User data in response:", response.data.user);
      console.log("Is new user:", response.data.isNewUser);
      console.log("================================");

      // Reset rate limiter on successful Google auth
      authRateLimiter.reset("google_auth");

      return response;
    } catch (error: any) {
      console.error("=== GOOGLE AUTH ERROR DEBUG ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error status text:", error.response?.statusText);
      console.error("Request URL:", error.config?.url);
      console.error("Request method:", error.config?.method);
      console.error("Request data:", error.config?.data);
      console.error("Full error object:", error);
      console.error("===============================");

      // Provide more specific error messages
      if (
        error.code === "ECONNREFUSED" ||
        error.message?.includes("Network Error")
      ) {
        throw new Error(
          "Backend server is not running. Please start your backend server on port 8000."
        );
      } else if (error.response?.status === 404) {
        throw new Error(
          "Google authentication endpoint not found. Please check if your backend has the /auth/google/ endpoint."
        );
      } else if (error.response?.status === 500) {
        throw new Error(
          "Server error during Google authentication. Please check your backend logs."
        );
      } else if (error.response?.status === 0) {
        throw new Error(
          "CORS error. Please check your backend CORS configuration."
        );
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error(`Google authentication failed: ${error.message}`);
      }
    }
  },

  // Complete Google registration with role
  completeGoogleRegistration: async (userData: {
    email: string;
    first_name: string;
    last_name: string;
    google_id: string;
    role: string;
  }): Promise<{
    data: {
      user: User;
      tokens: { access: string; refresh: string };
    };
  }> => {
    console.log("=== COMPLETE GOOGLE REGISTRATION DEBUG ===");
    console.log("Sending Google registration data:", userData);
    console.log("API URL:", API_BASE_URL);

    try {
      const response = await api.post("/auth/google/complete/", userData);

      console.log("=== COMPLETE GOOGLE REGISTRATION RESPONSE ===");
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("============================================");

      return response;
    } catch (error: any) {
      console.error("=== COMPLETE GOOGLE REGISTRATION ERROR DEBUG ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error status text:", error.response?.statusText);
      console.error("Request URL:", error.config?.url);
      console.error("Request method:", error.config?.method);
      console.error("Request data:", error.config?.data);
      console.error("Full error object:", error);
      console.error("=============================================");

      if (error.response?.status === 404) {
        throw new Error(
          "Google registration completion endpoint not found. Please check if your backend has the /auth/google/complete/ endpoint."
        );
      } else if (error.response?.status === 401) {
        throw new Error(
          "Authentication required for Google registration completion. Please try logging in again."
        );
      } else if (error.response?.status === 500) {
        throw new Error(
          "Server error during Google registration completion. Please check your backend logs."
        );
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error(
          `Google registration completion failed: ${error.message}`
        );
      }
    }
  },

  // Update user role (for existing users who need to choose role)
  updateUserRole: async (userData: {
    email: string;
    role: string;
  }): Promise<{
    data: {
      user: User;
      tokens: { access: string; refresh: string };
    };
  }> => {
    console.log("=== UPDATE USER ROLE DEBUG ===");
    console.log("Updating user role:", userData);
    console.log("API URL:", API_BASE_URL);

    try {
      const response = await api.post("/auth/role/update/", userData);

      console.log("=== UPDATE USER ROLE RESPONSE ===");
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("================================");

      return response;
    } catch (error: any) {
      console.error("=== UPDATE USER ROLE ERROR DEBUG ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error status text:", error.response?.statusText);
      console.error("Request URL:", error.config?.url);
      console.error("Request method:", error.config?.method);
      console.error("Request data:", error.config?.data);
      console.error("Full error object:", error);
      console.error("===================================");

      if (error.response?.status === 404) {
        throw new Error(
          "User role update endpoint not found. Please check if your backend has the /auth/role/update/ endpoint."
        );
      } else if (error.response?.status === 401) {
        throw new Error(
          "Authentication required for updating user role. Please try logging in again."
        );
      } else if (error.response?.status === 500) {
        throw new Error(
          "Server error during user role update. Please check your backend logs."
        );
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error(`User role update failed: ${error.message}`);
      }
    }
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{
    data: {
      user: User;
      tokens: { access: string; refresh: string };
    };
  }> => {
    // Rate limiting check
    if (!authRateLimiter.isAllowed(`login_${credentials.email}`)) {
      throw new Error("Too many login attempts. Please try again later.");
    }

    const response = await api.post("/auth/login/", credentials);

    // Reset rate limiter on successful login
    authRateLimiter.reset(`login_${credentials.email}`);

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      // Call backend logout endpoint to invalidate tokens
      await api.post("/auth/logout/");
    } catch (error) {
      console.warn("Backend logout failed, but clearing local data:", error);
      // Even if backend fails, we should clear local data for security
    } finally {
      // Always clear local storage regardless of backend response
      const { secureStorage } = await import("./security");
      secureStorage.removeItem("authToken");
      secureStorage.removeItem("user");
      secureStorage.removeItem("refreshToken");
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      // First check if we have user data in localStorage
      const { getCurrentUserFromStorage } = await import("./apiUtils");
      const localUser = getCurrentUserFromStorage();

      if (localUser) {
        return localUser;
      }

      // Only try API endpoint if no local data
      const response = await api.get("/auth/user/");
      return response.data;
    } catch (error) {
      // Fallback to localStorage
      const { getCurrentUserFromStorage } = await import("./apiUtils");
      const user = getCurrentUserFromStorage();
      if (!user) {
        throw new Error("No user found in localStorage");
      }
      return user;
    }
  },
};

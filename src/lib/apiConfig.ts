import axios from "axios";
import { secureStorage, getSecureHeaders } from "./security";
// import { debugAPI } from "./debugUtils";

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: getSecureHeaders(),
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = secureStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // debugAPI.logCall(config.url || "", config.method || "", undefined);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    // debugAPI.logCall(
    //   response.config?.url || "",
    //   response.config?.method || "",
    //   response.status
    // );
    return response;
  },
  (error) => {
    // Don't log errors for auth endpoints as these are expected to fail during logout
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register") ||
      error.config?.url?.includes("/auth/google") ||
      error.config?.url?.includes("/auth/logout");

    if (!isAuthEndpoint) {
      // Log detailed error information for debugging (only for non-auth endpoints)
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Don't redirect on auth endpoints (login/register) as these might fail due to invalid credentials
    if (error.response?.status === 401 && !isAuthEndpoint) {
      console.log("=== 401 ERROR - CHECKING AUTH DATA ===");
      console.log("URL:", error.config?.url);
      console.log("Method:", error.config?.method);
      console.log("Is auth endpoint:", isAuthEndpoint);

      // Only clear auth data if it's not an auth endpoint and we have a token
      const currentToken = secureStorage.getItem("authToken");
      const currentUser = secureStorage.getItem("user");

      if (currentToken && currentUser) {
        console.log("Clearing auth data due to 401 error");
        console.log("Current token exists:", !!currentToken);
        console.log("Current user exists:", !!currentUser);
        secureStorage.removeItem("authToken");
        secureStorage.removeItem("user");
        window.location.href = "/auth/login";
      } else {
        console.log("No token or user found, not clearing auth data");
        console.log("Token exists:", !!currentToken);
        console.log("User exists:", !!currentUser);
      }
    }
    return Promise.reject(error);
  }
);

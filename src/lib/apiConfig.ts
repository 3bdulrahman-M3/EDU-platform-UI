import axios from "axios";
import { secureStorage, getSecureHeaders } from "./security";

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Don't redirect on auth endpoints (login/register) as these might fail due to invalid credentials
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register") ||
      error.config?.url?.includes("/auth/google");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      secureStorage.removeItem("authToken");
      secureStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

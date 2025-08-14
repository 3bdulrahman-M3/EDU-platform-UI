import axios from "axios";
import {
  User,
  Course,
  Enrollment,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "@/types";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
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
    // Don't redirect on auth endpoints (login/register) as these might fail due to invalid credentials
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Types are now imported from @/types

// Auth API functions
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/login/", credentials);
    console.log("Raw login response:", response.data);
    return response.data;
  },

  logout: async (): Promise<void> => {
   
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/auth/user/");
    return response.data;
  },

  register: async (userData: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/register/", userData);
    return response.data;
  },
};

// Courses API functions
export const coursesAPI = {
  getAllCourses: async (): Promise<Course[]> => {
    const response = await api.get("/courses/");
    return response.data;
  },

  getCourseById: async (id: number): Promise<Course> => {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },

  searchCourses: async (query: string): Promise<Course[]> => {
    const response = await api.get(`/courses/?search=${query}`);
    return response.data;
  },
};

// Enrollment API functions
export const enrollmentAPI = {
  getEnrollments: async (): Promise<Enrollment[]> => {
    const response = await api.get("/enrollments/");
    return response.data;
  },

  enrollInCourse: async (courseId: number): Promise<Enrollment> => {
    const response = await api.post("/enrollments/", { course: courseId });
    return response.data;
  },

  unenrollFromCourse: async (enrollmentId: number): Promise<void> => {
    await api.delete(`/enrollments/${enrollmentId}/`);
  },
};

// Remove categories API since it's not in your Django models

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
};

export const setRefreshToken = (refreshToken: string) => {
  localStorage.setItem("refreshToken", refreshToken);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export default api;

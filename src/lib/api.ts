import axios from "axios";

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
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  short_description: string;
  instructor: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // in hours
  price: number;
  image_url: string;
  rating: number;
  enrolled_students: number;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Auth API functions
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/login/", credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout/");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/auth/user/");
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    username: string;
  }): Promise<AuthResponse> => {
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

  getCoursesByCategory: async (category: string): Promise<Course[]> => {
    const response = await api.get(`/courses/?category=${category}`);
    return response.data;
  },

  searchCourses: async (query: string): Promise<Course[]> => {
    const response = await api.get(`/courses/?search=${query}`);
    return response.data;
  },

  getPopularCourses: async (limit: number = 6): Promise<Course[]> => {
    const response = await api.get(
      `/courses/?ordering=-enrolled_students&limit=${limit}`
    );
    return response.data;
  },
};

// Categories API functions
export const categoriesAPI = {
  getAllCategories: async (): Promise<string[]> => {
    const response = await api.get("/categories/");
    return response.data;
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
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

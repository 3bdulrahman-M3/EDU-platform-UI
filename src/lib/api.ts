import axios from "axios";
import {
  User,
  Course,
  Enrollment,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  GoogleAuthResponse,
  GoogleRegistrationData,
} from "@/types";
import { secureStorage, RateLimiter, getSecureHeaders } from "./security";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: getSecureHeaders(),
});

// Rate limiter for auth endpoints
const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

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

// Helper function to get current user from localStorage
const getCurrentUserFromStorage = (): User | null => {
  const userStr = secureStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

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

    console.log("=== LOGIN API DEBUG ===");
    console.log("Sending login credentials:", { email: credentials.email });
    console.log("=========================");

    const response = await api.post("/auth/login/", credentials);

    console.log("=== LOGIN RESPONSE DEBUG ===");
    console.log("Full response:", response);
    console.log("Response data:", response.data);
    console.log("User data in response:", response.data.user);
    console.log("User role in response:", response.data.user?.role);
    console.log("===========================");

    // Reset rate limiter on successful login
    authRateLimiter.reset(`login_${credentials.email}`);

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      // Call backend logout endpoint to invalidate tokens
      await api.post("/auth/logout/");
      console.log("Backend logout successful");
    } catch (error) {
      console.warn("Backend logout failed, but clearing local data:", error);
      // Even if backend fails, we should clear local data for security
    } finally {
      // Always clear local storage regardless of backend response
      secureStorage.removeItem("authToken");
      secureStorage.removeItem("user");
      secureStorage.removeItem("refreshToken");
      console.log("Local storage cleared");
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      // Try the API endpoint first
      const response = await api.get("/auth/user/");
      return response.data;
    } catch (error) {
      console.warn(
        "API endpoint /auth/user/ not available, using localStorage"
      );
      // Fallback to localStorage
      const user = getCurrentUserFromStorage();
      if (!user) {
        throw new Error("No user found in localStorage");
      }
      return user;
    }
  },
};

// Instructor API functions - Using existing endpoints
export const instructorAPI = {
  // Create a new course
  createCourse: async (courseData: {
    title: string;
    description: string;
    image?: File;
  }): Promise<Course> => {
    try {
      console.log("=== CREATE COURSE DEBUG ===");
      console.log("Course data to send:", {
        title: courseData.title,
        description: courseData.description,
        hasImage: !!courseData.image,
        imageName: courseData.image?.name,
        imageSize: courseData.image?.size,
      });

      // Validate required fields
      if (!courseData.title?.trim()) {
        throw new Error("Course title is required");
      }
      if (!courseData.description?.trim()) {
        throw new Error("Course description is required");
      }

      // Create FormData
      const formData = new FormData();
      formData.append("title", courseData.title.trim());
      formData.append("description", courseData.description.trim());

      // Add image if provided
      if (courseData.image) {
        // Validate image file
        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
        ];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(courseData.image.type)) {
          throw new Error("Invalid image format. Please use PNG, JPG, or GIF.");
        }

        if (courseData.image.size > maxSize) {
          throw new Error("Image file is too large. Maximum size is 10MB.");
        }

        formData.append("image", courseData.image);
        console.log("Image appended to FormData:", courseData.image.name);
      }

      console.log("Sending request to:", `${API_BASE_URL}/courses/create/`);

      const response = await api.post("/courses/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("=== CREATE COURSE SUCCESS ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("=== END CREATE COURSE DEBUG ===");

      return response.data;
    } catch (error) {
      console.error("=== CREATE COURSE ERROR ===");
      console.error("Error creating course:", error);

      // Handle different types of errors
      if (error instanceof Error) {
        // Custom validation errors
        throw error;
      } else if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;

        console.error("Axios error details:", {
          status,
          statusText: axiosError.response?.statusText,
          data,
          url: axiosError.config?.url,
        });

        // Handle specific HTTP status codes
        switch (status) {
          case 400:
            if (data?.title) {
              throw new Error(
                `Title: ${
                  Array.isArray(data.title) ? data.title[0] : data.title
                }`
              );
            } else if (data?.description) {
              throw new Error(
                `Description: ${
                  Array.isArray(data.description)
                    ? data.description[0]
                    : data.description
                }`
              );
            } else if (data?.image) {
              throw new Error(
                `Image: ${
                  Array.isArray(data.image) ? data.image[0] : data.image
                }`
              );
            } else if (data?.message) {
              throw new Error(data.message);
            } else {
              throw new Error("Invalid course data. Please check your input.");
            }
          case 401:
            throw new Error("Authentication required. Please log in again.");
          case 403:
            throw new Error(
              "Access denied. Only instructors can create courses."
            );
          case 413:
            throw new Error("File too large. Please use a smaller image.");
          default:
            throw new Error(
              data?.message || "Failed to create course. Please try again."
            );
        }
      } else {
        // Network or other errors
        console.error("Network error:", error);
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      }
    }
  },

  // Get all courses created by the instructor - Using existing endpoint
  getMyCourses: async (): Promise<Course[]> => {
    try {
      console.log("=== GET MY COURSES DEBUG ===");
      console.log("Fetching all courses from:", `${API_BASE_URL}/courses/`);

      // Since your backend doesn't have instructor-specific endpoint yet,
      // we'll get all courses and filter by instructor on frontend
      const response = await api.get("/courses/");
      console.log("Courses response received:", response.data);

      const allCourses = response.data;

      // Get current user to filter courses
      const currentUser = await authAPI.getCurrentUser();
      console.log("Current user for filtering:", currentUser);

      // Filter courses created by current instructor
      const filteredCourses = allCourses.filter(
        (course: Course) => course.instructor?.id === currentUser.id
      );
      console.log("Filtered courses for instructor:", filteredCourses);
      console.log("=== END GET MY COURSES DEBUG ===");

      return filteredCourses;
    } catch (error) {
      console.error("=== GET MY COURSES ERROR ===");
      console.error("Error in getMyCourses:", error);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      console.error("Full error object:", JSON.stringify(error, null, 2));

      // Try to extract error details from different possible structures
      const errorDetails = {
        message: error instanceof Error ? error.message : "Unknown error",
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : undefined,
        // Axios error structure
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        url: (error as any)?.config?.url,
        method: (error as any)?.config?.method,
        // Direct properties
        data: (error as any)?.data,
        statusCode: (error as any)?.status,
      };

      console.error("Extracted error details:", errorDetails);
      console.error("=== END GET MY COURSES ERROR ===");
      return [];
    }
  },

  // Get students enrolled in a specific course
  getCourseStudents: async (courseId: number): Promise<Enrollment[]> => {
    try {
      const response = await api.get(`/courses/${courseId}/enrollments/`);
      // Transform the response to match Enrollment format
      const students = response.data;
      return students.map(
        (student: { id: number; [key: string]: unknown }) => ({
          id: student.id,
          student: student,
          course: { id: courseId },
          enrolled_at: new Date().toISOString(),
          withdrawn_at: null,
          is_active: true,
        })
      );
    } catch (error) {
      console.error("Error in getCourseStudents:", error);
      return [];
    }
  },

  // Get students who withdrew from a specific course
  getWithdrawnStudents: async (courseId: number): Promise<Enrollment[]> => {
    // Since your backend doesn't have withdrawn students endpoint yet,
    // return empty array for now
    return [];
  },
};

// Student API functions - Using existing endpoints
export const studentAPI = {
  // Get newest courses (exclude already enrolled courses)
  getNewestCourses: async (): Promise<Course[]> => {
    try {
      const response = await api.get("/courses/");
      return response.data;
    } catch (error) {
      console.error("Error in getNewestCourses:", error);
      return [];
    }
  },

  // Enroll in a course
  enrollInCourse: async (courseId: number): Promise<Enrollment> => {
    const response = await api.post(`/courses/${courseId}/enroll/`);
    return response.data;
  },

  // Withdraw from a course
  withdrawFromCourse: async (courseId: number): Promise<void> => {
    await api.post(`/courses/${courseId}/withdraw/`);
  },

  // Get courses the student is enrolled in - Using existing endpoint
  getMyEnrolledCourses: async (): Promise<Enrollment[]> => {
    try {
      // Get current user to get student ID
      const currentUser = await authAPI.getCurrentUser();

      // Try the existing endpoint that takes student_id as parameter
      try {
        const response = await api.get(
          `/courses/student/${currentUser.id}/enrollments/`
        );

        // Transform the response to match Enrollment format
        const courses = response.data;
        return courses.map((course: Course) => ({
          id: course.id,
          student: currentUser,
          course: course,
          enrolled_at: new Date().toISOString(),
          withdrawn_at: null,
          is_active: true,
        }));
      } catch (endpointError) {
        console.warn(
          "Student enrollments endpoint not available, returning empty array"
        );
        return [];
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      // If the endpoint fails, return empty array
      return [];
    }
  },
};

// General Courses API functions
export const coursesAPI = {
  getAllCourses: async (): Promise<Course[]> => {
    try {
      console.log("Fetching all courses from:", `${API_BASE_URL}/courses/`);
      const response = await api.get("/courses/");
      console.log("Courses response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getAllCourses:", error);
      // Return empty array instead of throwing
      return [];
    }
  },

  getCourseById: async (id: number): Promise<Course> => {
    try {
      const response = await api.get(`/courses/?id=${id}`);
      return response.data;
    } catch (error) {
      console.error("Error in getCourseById:", error);
      throw error;
    }
  },

  searchCourses: async (query: string): Promise<Course[]> => {
    try {
      const response = await api.get(`/courses/?search=${query}`);
      return response.data;
    } catch (error) {
      console.error("Error in searchCourses:", error);
      return [];
    }
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  secureStorage.setItem("authToken", token);
};

export const setRefreshToken = (refreshToken: string) => {
  secureStorage.setItem("refreshToken", refreshToken);
};

export const getAuthToken = (): string | null => {
  return secureStorage.getItem("authToken");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getUser = (): User | null => {
  return getCurrentUserFromStorage();
};

export const setUser = (user: User) => {
  secureStorage.setItem("user", JSON.stringify(user));
};

export default api;

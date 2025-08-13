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
      error.config?.url?.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Helper function to get current user from localStorage
const getCurrentUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem("user");
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

    return response;
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

    return response;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
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
    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    if (courseData.image) {
      formData.append("image", courseData.image);
    }

    const response = await api.post("/courses/create/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
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
  return getCurrentUserFromStorage();
};

export const setUser = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export default api;

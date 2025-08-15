import { Course, Enrollment } from "@/types";
import { api, API_BASE_URL } from "./apiConfig";
import { authAPI } from "./authAPI";

// Instructor API functions
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

  // Get all courses created by the instructor
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

      // Check if it's a connection error
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ERR_NETWORK"
      ) {
        console.error("Network error - backend server not running");
        return [];
      }

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
      const response = await api.get(
        `/courses/instructor/courses/${courseId}/students/`
      );
      // Transform the response to match Enrollment format
      const students = response.data;
      return students.map((enrollment: any) => ({
        id: enrollment.id,
        student: enrollment.student,
        course: enrollment.course,
        enrolled_at: enrollment.enrolled_at,
        withdrawn_at: enrollment.withdrawn_at,
        is_active: enrollment.is_active,
      }));
    } catch (error) {
      console.error("Error in getCourseStudents:", error);
      return [];
    }
  },

  // Get students who withdrew from a specific course
  getWithdrawnStudents: async (courseId: number): Promise<Enrollment[]> => {
    try {
      const response = await api.get(
        `/courses/instructor/courses/${courseId}/withdrawn/`
      );
      // Transform the response to match Enrollment format
      const students = response.data;
      return students.map((enrollment: any) => ({
        id: enrollment.id,
        student: enrollment.student,
        course: enrollment.course,
        enrolled_at: enrollment.enrolled_at,
        withdrawn_at: enrollment.withdrawn_at,
        is_active: enrollment.is_active,
      }));
    } catch (error) {
      console.error("Error in getWithdrawnStudents:", error);
      return [];
    }
  },

  // Get all enrollments for a course (both active and withdrawn)
  getAllCourseEnrollments: async (courseId: number): Promise<Enrollment[]> => {
    try {
      // Since the backend doesn't have a single endpoint for all enrollments,
      // we'll fetch both active and withdrawn students and combine them
      const [activeResponse, withdrawnResponse] = await Promise.all([
        api.get(`/courses/instructor/courses/${courseId}/students/`),
        api.get(`/courses/instructor/courses/${courseId}/withdrawn/`),
      ]);

      const activeStudents = activeResponse.data;
      const withdrawnStudents = withdrawnResponse.data;

      console.log("=== INSTRUCTOR API DEBUG ===");
      console.log("Active students response:", activeStudents);
      console.log("Withdrawn students response:", withdrawnStudents);
      console.log("Course ID:", courseId);

      const allEnrollments = [
        ...activeStudents.map((enrollment: any) => ({
          id: enrollment.id,
          student: enrollment.student,
          course: enrollment.course,
          enrolled_at: enrollment.enrolled_at,
          withdrawn_at: enrollment.withdrawn_at,
          is_active: enrollment.is_active,
        })),
        ...withdrawnStudents.map((enrollment: any) => ({
          id: enrollment.id,
          student: enrollment.student,
          course: enrollment.course,
          enrolled_at: enrollment.enrolled_at,
          withdrawn_at: enrollment.withdrawn_at,
          is_active: enrollment.is_active,
        })),
      ];

      console.log("Combined enrollments:", allEnrollments);
      console.log("=== END INSTRUCTOR API DEBUG ===");

      return allEnrollments;
    } catch (error) {
      console.error("Error in getAllCourseEnrollments:", error);
      return [];
    }
  },
};

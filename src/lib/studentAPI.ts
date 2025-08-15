import { Course, Enrollment } from "@/types";
import { api } from "./apiConfig";

// Student API functions
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
    try {
      const response = await api.post(`/courses/${courseId}/enroll/`);
      return response.data;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw error;
    }
  },

  // Withdraw from a course
  withdrawFromCourse: async (courseId: number): Promise<void> => {
    try {
      await api.post(`/courses/${courseId}/withdraw/`);
    } catch (error) {
      console.error("Error withdrawing from course:", error);
      throw error;
    }
  },

  // Get courses the student is enrolled in
  getMyEnrolledCourses: async (): Promise<Enrollment[]> => {
    try {
      const response = await api.get("/courses/student/courses/");
      // Transform the response to match Enrollment format
      const courses = response.data;
      return courses.map((enrollment: any) => ({
        id: enrollment.id,
        student: enrollment.student,
        course: enrollment.course,
        enrolled_at: enrollment.enrolled_at,
        withdrawn_at: enrollment.withdrawn_at,
        is_active: enrollment.is_active,
      }));
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      return [];
    }
  },

  // Get courses the student has withdrawn from
  getMyWithdrawnCourses: async (): Promise<Enrollment[]> => {
    try {
      // Since the backend doesn't have a specific endpoint for withdrawn courses,
      // we'll get all enrollments and filter for withdrawn ones
      const response = await api.get("/courses/student/courses/");
      const courses = response.data;
      return courses
        .filter((enrollment: any) => enrollment.withdrawn_at) // Only withdrawn courses
        .map((enrollment: any) => ({
          id: enrollment.id,
          student: enrollment.student,
          course: enrollment.course,
          enrolled_at: enrollment.enrolled_at,
          withdrawn_at: enrollment.withdrawn_at,
          is_active: enrollment.is_active,
        }));
    } catch (error) {
      console.error("Error fetching withdrawn courses:", error);
      return [];
    }
  },

  // Get all student enrollments (both active and withdrawn)
  getAllMyEnrollments: async (): Promise<Enrollment[]> => {
    try {
      const response = await api.get("/courses/student/courses/");
      const courses = response.data;

      console.log("=== STUDENT API DEBUG ===");
      console.log("Raw response data:", courses);

      const mappedCourses = courses.map((enrollment: any) => ({
        id: enrollment.id,
        student: enrollment.student,
        course: enrollment.course,
        enrolled_at: enrollment.enrolled_at,
        withdrawn_at: enrollment.withdrawn_at,
        is_active: enrollment.is_active,
      }));

      console.log("Mapped enrollments:", mappedCourses);
      console.log("=== END STUDENT API DEBUG ===");

      return mappedCourses;
    } catch (error) {
      console.error("Error fetching all enrollments:", error);
      return [];
    }
  },
};

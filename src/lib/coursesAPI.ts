import { Course } from "@/types";
import { api, API_BASE_URL } from "./apiConfig";

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

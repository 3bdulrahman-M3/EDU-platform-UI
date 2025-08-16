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

  // Create a new course (instructor only)
  createCourse: async (courseData: {
    title: string;
    description: string;
    image?: File;
    price?: number;
    duration?: number;
    level?: string;
    category?: string;
  }) => {
    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    if (courseData.image) formData.append("image", courseData.image);
    if (courseData.price) formData.append("price", String(courseData.price));
    if (courseData.duration)
      formData.append("duration", String(courseData.duration));
    if (courseData.level) formData.append("level", courseData.level);
    if (courseData.category) formData.append("category", courseData.category);
    const response = await api.post("/courses/create/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update a course (instructor only)
  updateCourse: async (
    id: number,
    courseData: {
      title?: string;
      description?: string;
      image?: File;
      price?: number;
      duration?: number;
      level?: string;
      category?: string;
    }
  ) => {
    const formData = new FormData();
    if (courseData.title) formData.append("title", courseData.title);
    if (courseData.description)
      formData.append("description", courseData.description);
    if (courseData.image) formData.append("image", courseData.image);
    if (courseData.price) formData.append("price", String(courseData.price));
    if (courseData.duration)
      formData.append("duration", String(courseData.duration));
    if (courseData.level) formData.append("level", courseData.level);
    if (courseData.category) formData.append("category", courseData.category);
    const response = await api.put(`/courses/${id}/update/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Delete a course (instructor only)
  deleteCourse: async (id: number) => {
    const response = await api.delete(`/courses/${id}/delete/`);
    return response.data;
  },
};

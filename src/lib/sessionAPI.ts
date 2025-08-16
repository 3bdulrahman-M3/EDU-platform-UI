import { api } from "./apiConfig";
import {
  Session,
  BookingRequest,
  SessionMaterial,
  Notification,
} from "@/types";

interface SessionFilters {
  status?: string;
  subject?: string;
  level?: string;
  date_from?: string;
  date_to?: string;
  creator?: number;
}

export const sessionAPI = {
  // Get all sessions
  getSessions: async (
    filters?: SessionFilters
  ): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Session[];
  }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.level) params.append("level", filters.level);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.creator) params.append("creator", filters.creator.toString());

    const response = await api.get(`/sessions/?${params}`);
    return response.data;
  },

  // Get session details
  getSessionDetails: async (id: number): Promise<Session> => {
    console.log("=== GET SESSION DETAILS DEBUG ===");
    console.log("Session ID:", id);
    console.log("Request URL:", `/sessions/${id}/`);
    console.log(
      "API Base URL:",
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
    );

    // Check authentication
    const token = localStorage.getItem("authToken");
    console.log("Auth token exists:", !!token);

    try {
      const response = await api.get(`/sessions/${id}/`);
      console.log("✅ Session details response:", response.data);
      return response.data;
    } catch (error: any) {
      console.log("❌ Error getting session details:");
      console.log("Error status:", error.response?.status);
      console.log("Error data:", error.response?.data);
      console.log("Error message:", error.message);
      throw error;
    }
  },

  // Create session
  createSession: async (data: Partial<Session>): Promise<Session> => {
    console.log("=== CREATE SESSION DEBUG ===");
    console.log("Creating session with data:", data);

    const payload = {
      ...data,
      timezone_offset: new Date().getTimezoneOffset(),
    };

    console.log("Payload being sent:", payload);
    console.log("API URL:", "/sessions/");

    try {
      const response = await api.post("/sessions/", payload);
      console.log("✅ Session created successfully:", response.data);

      // Validate the response has an ID
      if (!response.data || !response.data.id) {
        console.error(
          "❌ Session creation response missing ID:",
          response.data
        );
        throw new Error("Session creation failed - no ID returned");
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating session:");
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);
      throw error;
    }
  },

  // Update session
  updateSession: async (
    id: number,
    data: Partial<Session>
  ): Promise<Session> => {
    const payload = {
      ...data,
      timezone_offset: new Date().getTimezoneOffset(),
    };
    const response = await api.put(`/sessions/${id}/`, payload);
    return response.data;
  },

  // Delete session
  deleteSession: async (id: number): Promise<void> => {
    await api.delete(`/sessions/${id}/`);
  },

  // Join session
  joinSession: async (
    sessionId: number,
    message?: string
  ): Promise<BookingRequest> => {
    const payload: any = {};
    if (message) {
      payload.message = message;
    }

    console.log("=== JOIN SESSION DEBUG ===");
    console.log("Session ID:", sessionId);
    console.log("Message:", message);
    console.log("Payload:", payload);
    console.log("Request URL:", `/sessions/${sessionId}/join/`);
    console.log(
      "API Base URL:",
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
    );

    // Check authentication
    const token = localStorage.getItem("authToken");
    console.log("Auth token exists:", !!token);
    console.log(
      "Auth token preview:",
      token ? `${token.substring(0, 20)}...` : "No token"
    );

    try {
      const response = await api.post(`/sessions/${sessionId}/join/`, payload);
      console.log("✅ Success response:", response.data);
      return response.data;
    } catch (error: any) {
      console.log("❌ Error details:");
      console.log("Error status:", error.response?.status);
      console.log("Error data:", error.response?.data);
      console.log("Error message:", error.message);
      console.log("Full error:", error);

      // Enhanced error handling for specific backend error messages
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        console.log("Backend error data:", errorData);

        // Check for specific error messages from your backend
        if (typeof errorData === "string") {
          throw new Error(errorData);
        } else if (errorData?.message) {
          throw new Error(errorData.message);
        } else if (errorData?.detail) {
          throw new Error(errorData.detail);
        } else if (errorData?.error) {
          throw new Error(errorData.error);
        }
      } else if (error.response?.status === 500) {
        console.log("🚨 SERVER ERROR (500) - Check Django logs");
        console.log("Error response:", error.response);
        console.log("Error data:", error.response?.data);

        // Try to extract error details from 500 response
        const errorData = error.response?.data;
        if (errorData?.detail) {
          throw new Error(`Server error: ${errorData.detail}`);
        } else if (errorData?.message) {
          throw new Error(`Server error: ${errorData.message}`);
        } else if (typeof errorData === "string") {
          throw new Error(`Server error: ${errorData}`);
        } else {
          throw new Error(
            "Internal server error - check Django logs for details"
          );
        }
      }

      throw error;
    }
  },

  // Approve request
  approveRequest: async (sessionId: number, userId: number): Promise<void> => {
    await api.post(`/sessions/${sessionId}/approve_request/`, {
      user_id: userId,
    });
  },

  // Reject request
  rejectRequest: async (sessionId: number, userId: number): Promise<void> => {
    await api.post(`/sessions/${sessionId}/reject_request/`, {
      user_id: userId,
    });
  },

  // Cancel session
  cancelSession: async (sessionId: number): Promise<void> => {
    await api.post(`/sessions/${sessionId}/cancel/`);
  },

  // Start session (for creators)
  startSession: async (sessionId: number): Promise<Session> => {
    console.log("⚠️ TEMPORARY: Using mock response for start session");
    // Temporary: return mock response until start endpoint is implemented
    return {
      id: sessionId,
      status: "ongoing",
      started_at: new Date().toISOString(),
    } as unknown as Session;
  },

  // End session (for creators)
  endSession: async (sessionId: number): Promise<Session> => {
    console.log("⚠️ TEMPORARY: Using mock response for end session");
    // Temporary: return mock response until end endpoint is implemented
    return {
      id: sessionId,
      status: "completed",
      ended_at: new Date().toISOString(),
    } as unknown as Session;
  },

  // Join live session (for participants)
  joinLiveSession: async (sessionId: number): Promise<Session> => {
    console.log("⚠️ TEMPORARY: Using join endpoint instead of join_live");
    console.log("Session ID:", sessionId);
    console.log("Request URL:", `/sessions/${sessionId}/join/`);

    try {
      // Temporary: use the regular join endpoint until join_live is implemented
      const response = await api.post(`/sessions/${sessionId}/join/`);
      console.log("✅ Join response:", response.data);
      return response.data;
    } catch (error: any) {
      console.log("❌ Error joining session:");
      console.log("Error status:", error.response?.status);
      console.log("Error data:", error.response?.data);
      console.log("Error message:", error.message);

      // If the join endpoint fails, return a mock response for testing
      console.log("⚠️ Returning mock response for testing");

      // Check if it's an "Already joined" error
      if (error.response?.data?.error === "Already joined") {
        console.log(
          "✅ User is already a participant, proceeding with mock response"
        );
        return {
          id: sessionId,
          status: "ongoing",
          message: "Already joined session",
        } as unknown as Session;
      }

      return {
        id: sessionId,
        status: "ongoing",
        message: "Joined successfully (mock response)",
      } as unknown as Session;
    }
  },

  // Leave live session
  leaveLiveSession: async (sessionId: number): Promise<void> => {
    console.log("⚠️ TEMPORARY: Using mock response for leave live session");
    console.log("Session ID:", sessionId);

    try {
      await api.post(`/sessions/${sessionId}/leave_live/`);
      console.log("✅ Left live session successfully");
    } catch (error: any) {
      console.log("❌ Error leaving session:");
      console.log("Error status:", error.response?.status);
      console.log("Error data:", error.response?.data);
      console.log("⚠️ Continuing with mock response");
      // Continue without throwing error for testing
    }
  },

  // Get my sessions
  getMySessions: async (): Promise<{
    created: Session[];
    joined: Session[];
  }> => {
    const response = await api.get("/sessions/my_sessions/");
    return response.data;
  },

  // Get notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get("/notifications/");
    return response.data;
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    await api.post(`/notifications/${notificationId}/mark_as_read/`);
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (): Promise<void> => {
    await api.post("/notifications/mark_all_as_read/");
  },

  // Get session materials
  getSessionMaterials: async (
    sessionId: number
  ): Promise<SessionMaterial[]> => {
    const response = await api.get(`/sessions/${sessionId}/materials/`);
    return response.data;
  },

  // Upload material
  uploadMaterial: async (
    sessionId: number,
    material: FormData
  ): Promise<SessionMaterial> => {
    const response = await api.post(
      `/sessions/${sessionId}/materials/`,
      material,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  // Update material
  updateMaterial: async (
    sessionId: number,
    materialId: number,
    data: Partial<SessionMaterial>
  ): Promise<SessionMaterial> => {
    const response = await api.put(
      `/sessions/${sessionId}/materials/${materialId}/`,
      data
    );
    return response.data;
  },

  // Delete material
  deleteMaterial: async (
    sessionId: number,
    materialId: number
  ): Promise<void> => {
    await api.delete(`/sessions/${sessionId}/materials/${materialId}/`);
  },
};

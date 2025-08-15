import { Session, Participant } from "@/types";
import { api } from "./apiConfig";

// Helper function to handle API errors
const handleApiError = (error: any): never => {
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  } else if (error.message) {
    throw new Error(error.message);
  } else {
    throw new Error("An unexpected error occurred");
  }
};

export const sessionAPI = {
  // Get all sessions with optional filters
  getSessions: async (filters?: {
    page?: number;
    page_size?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
    creator?: number;
  }): Promise<Session[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get(
        `/sessions/${params.toString() ? `?${params.toString()}` : ""}`
      );
      return response.data.results;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Get session by ID
  getSessionDetails: async (id: number): Promise<Session> => {
    try {
      const response = await api.get(`/sessions/${id}/`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Create new session
  createSession: async (data: {
    title: string;
    description: string;
    date: string;
    max_participants: number;
  }): Promise<Session> => {
    try {
      const response = await api.post("/sessions/", data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Update session
  updateSession: async (
    id: number,
    data: {
      title?: string;
      description?: string;
      date?: string;
      max_participants?: number;
    }
  ): Promise<Session> => {
    try {
      const response = await api.put(`/sessions/${id}/`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Delete session
  deleteSession: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/sessions/${id}/`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Join a session
  joinSession: async (id: number): Promise<Session> => {
    try {
      const response = await api.post(`/sessions/${id}/join/`);
      return response.data.session;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Leave a session
  leaveSession: async (id: number): Promise<Session> => {
    try {
      const response = await api.post(`/sessions/${id}/leave/`);
      return response.data.session;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Cancel a session (creator only)
  cancelSession: async (id: number): Promise<Session> => {
    try {
      const response = await api.post(`/sessions/${id}/cancel/`);
      return response.data.session;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Start a session (creator only)
  startSession: async (id: number): Promise<Session> => {
    try {
      const response = await api.post(`/sessions/${id}/start/`);
      return response.data.session;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Complete a session (creator only)
  completeSession: async (id: number): Promise<Session> => {
    try {
      const response = await api.post(`/sessions/${id}/complete/`);
      return response.data.session;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Get user's sessions (created or joined)
  getMySessions: async (filters?: {
    page?: number;
    page_size?: number;
  }): Promise<Session[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get(
        `/sessions/my_sessions/${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );
      return response.data.results;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Get sessions created by user
  getCreatedSessions: async (): Promise<Session[]> => {
    try {
      const response = await api.get("/sessions/created_sessions/");
      return response.data.results;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Get sessions joined by user
  getJoinedSessions: async (): Promise<Session[]> => {
    try {
      const response = await api.get("/sessions/joined_sessions/");
      return response.data.results;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Get session participants
  getSessionParticipants: async (id: number): Promise<Participant[]> => {
    try {
      const response = await api.get(`/sessions/${id}/participants/`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

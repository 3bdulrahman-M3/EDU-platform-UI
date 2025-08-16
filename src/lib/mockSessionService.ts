import {
  Session,
  BookingRequest,
  SessionMaterial,
  Notification,
  User,
} from "@/types";

// Mock data storage
let sessions: Session[] = [];
let bookingRequests: BookingRequest[] = [];
let notifications: Notification[] = [];

// Mock users for demo
const mockUsers: User[] = [
  {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    username: "johndoe",
    role: "instructor",
    date_joined: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@example.com",
    username: "janesmith",
    role: "student",
    date_joined: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    first_name: "Mike",
    last_name: "Johnson",
    email: "mike@example.com",
    username: "mikejohnson",
    role: "instructor",
    date_joined: "2024-01-03T00:00:00Z",
  },
];

// Initialize mock data
const initializeMockData = () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  sessions = [
    {
      id: 1,
      title: "Advanced JavaScript Concepts",
      description:
        "Deep dive into closures, promises, and async/await patterns",
      subject: "Programming",
      level: "advanced",
      date: tomorrow.toISOString(),
      duration: 90,
      max_participants: 5,
      creator: mockUsers[0],
      participants: [],
      status: "scheduled",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      available_spots: 5,
      can_join: true,
      participant_count: 0,
      materials: [
        {
          id: 1,
          title: "JavaScript Fundamentals PDF",
          type: "file",
          file_name: "js-fundamentals.pdf",
          uploaded_by: mockUsers[0],
          uploaded_at: now.toISOString(),
        },
      ],
    },
    {
      id: 2,
      title: "React Hooks Workshop",
      description: "Learn useState, useEffect, and custom hooks",
      subject: "Programming",
      level: "intermediate",
      date: nextWeek.toISOString(),
      duration: 120,
      max_participants: 8,
      creator: mockUsers[2],
      participants: [
        {
          id: 1,
          user: mockUsers[1],
          joined_at: now.toISOString(),
          role: "student",
          status: "approved",
        },
      ],
      status: "scheduled",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      available_spots: 7,
      can_join: true,
      participant_count: 1,
    },
    {
      id: 3,
      title: "Python for Beginners",
      description: "Introduction to Python programming basics",
      subject: "Programming",
      level: "beginner",
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      max_participants: 10,
      creator: mockUsers[0],
      participants: [],
      status: "scheduled",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      available_spots: 10,
      can_join: true,
      participant_count: 0,
    },
  ];

  bookingRequests = [
    {
      id: 1,
      user: mockUsers[1],
      session_id: 1,
      requested_at: now.toISOString(),
      status: "pending",
      message: "I'm interested in learning advanced JavaScript concepts",
    },
  ];

  notifications = [
    {
      id: 1,
      title: "Session Reminder",
      message: "Your session with John Doe starts in 30 minutes",
      type: "reminder",
      created_at: now.toISOString(),
      read: false,
      session_id: 1,
    },
    {
      id: 2,
      title: "New Booking Request",
      message: "Jane Smith wants to join your JavaScript session",
      type: "booking_request",
      created_at: now.toISOString(),
      read: false,
      session_id: 1,
    },
  ];
};

// Initialize data on first import
if (sessions.length === 0) {
  initializeMockData();
}

// Simulate API delay
const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockSessionService = {
  // Get all sessions with optional filters
  getSessions: async (filters?: any): Promise<Session[]> => {
    await delay();

    let filteredSessions = [...sessions];

    if (filters) {
      if (filters.subject) {
        filteredSessions = filteredSessions.filter((s) =>
          s.subject.toLowerCase().includes(filters.subject.toLowerCase())
        );
      }
      if (filters.level) {
        filteredSessions = filteredSessions.filter(
          (s) => s.level === filters.level
        );
      }
      if (filters.status) {
        filteredSessions = filteredSessions.filter(
          (s) => s.status === filters.status
        );
      }
      if (filters.date_from) {
        filteredSessions = filteredSessions.filter(
          (s) => new Date(s.date) >= new Date(filters.date_from)
        );
      }
      if (filters.date_to) {
        filteredSessions = filteredSessions.filter(
          (s) => new Date(s.date) <= new Date(filters.date_to)
        );
      }
    }

    return filteredSessions;
  },

  // Get session details by ID
  getSessionDetails: async (id: number): Promise<Session> => {
    await delay();

    const session = sessions.find((s) => s.id === id);
    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  },

  // Create new session
  createSession: async (data: Partial<Session>): Promise<Session> => {
    await delay();

    const newSession: Session = {
      id: sessions.length + 1,
      title: data.title || "",
      description: data.description || "",
      subject: data.subject || "General",
      level: data.level || "beginner",
      date: data.date || new Date().toISOString(),
      duration: data.duration || 60,
      max_participants: data.max_participants || 5,
      creator: data.creator || mockUsers[0],
      participants: [],
      status: "scheduled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      available_spots: data.max_participants || 5,
      can_join: true,
      participant_count: 0,
    };

    sessions.push(newSession);
    return newSession;
  },

  // Join/Request session
  joinSession: async (
    sessionId: number,
    userId: number,
    message?: string
  ): Promise<BookingRequest> => {
    await delay();

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    const bookingRequest: BookingRequest = {
      id: bookingRequests.length + 1,
      user,
      session_id: sessionId,
      requested_at: new Date().toISOString(),
      status: "pending",
      message,
    };

    bookingRequests.push(bookingRequest);

    // Add notification for tutor
    notifications.push({
      id: notifications.length + 1,
      title: "New Booking Request",
      message: `${user.first_name} ${user.last_name} wants to join your session "${session.title}"`,
      type: "booking_request",
      created_at: new Date().toISOString(),
      read: false,
      session_id: sessionId,
    });

    return bookingRequest;
  },

  // Approve booking request
  approveRequest: async (
    sessionId: number,
    userId: number
  ): Promise<Session> => {
    await delay();

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update booking request status
    const request = bookingRequests.find(
      (r) => r.session_id === sessionId && r.user.id === userId
    );
    if (request) {
      request.status = "approved";
    }

    // Add user to participants
    const participant = {
      id: session.participants.length + 1,
      user,
      joined_at: new Date().toISOString(),
      role: "student" as const,
      status: "approved" as const,
    };

    session.participants.push(participant);
    session.participant_count = session.participants.length;
    session.available_spots = Math.max(
      0,
      session.max_participants - session.participant_count
    );
    session.updated_at = new Date().toISOString();

    // Add notification for student
    notifications.push({
      id: notifications.length + 1,
      title: "Booking Approved",
      message: `Your request to join "${session.title}" has been approved`,
      type: "session_update",
      created_at: new Date().toISOString(),
      read: false,
      session_id: sessionId,
    });

    return session;
  },

  // Reject booking request
  rejectRequest: async (
    sessionId: number,
    userId: number
  ): Promise<Session> => {
    await delay();

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Update booking request status
    const request = bookingRequests.find(
      (r) => r.session_id === sessionId && r.user.id === userId
    );
    if (request) {
      request.status = "rejected";
    }

    // Add notification for student
    notifications.push({
      id: notifications.length + 1,
      title: "Booking Rejected",
      message: `Your request to join "${session.title}" has been rejected`,
      type: "session_update",
      created_at: new Date().toISOString(),
      read: false,
      session_id: sessionId,
    });

    return session;
  },

  // Cancel session (for students) or cancel session (for tutors)
  cancelSession: async (
    sessionId: number,
    userId: number
  ): Promise<Session> => {
    await delay();

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If user is the creator, cancel the entire session
    if (session.creator.id === userId) {
      session.status = "cancelled";
      session.updated_at = new Date().toISOString();

      // Notify all participants
      session.participants.forEach((participant) => {
        notifications.push({
          id: notifications.length + 1,
          title: "Session Cancelled",
          message: `The session "${session.title}" has been cancelled by the tutor`,
          type: "session_update",
          created_at: new Date().toISOString(),
          read: false,
          session_id: sessionId,
        });
      });
    } else {
      // If user is a participant, remove them from the session
      session.participants = session.participants.filter(
        (p) => p.user.id !== userId
      );
      session.participant_count = session.participants.length;
      session.available_spots = Math.max(
        0,
        session.max_participants - session.participant_count
      );
      session.updated_at = new Date().toISOString();

      // Update booking request
      const request = bookingRequests.find(
        (r) => r.session_id === sessionId && r.user.id === userId
      );
      if (request) {
        request.status = "rejected";
      }
    }

    return session;
  },

  // Get user's sessions (as tutor or student)
  getMySessions: async (userId: number): Promise<Session[]> => {
    await delay();

    return sessions.filter(
      (s) =>
        s.creator.id === userId ||
        s.participants.some((p) => p.user.id === userId)
    );
  },

  // Get sessions created by user
  getCreatedSessions: async (userId: number): Promise<Session[]> => {
    await delay();

    return sessions.filter((s) => s.creator.id === userId);
  },

  // Get sessions joined by user
  getJoinedSessions: async (userId: number): Promise<Session[]> => {
    await delay();

    return sessions.filter((s) =>
      s.participants.some((p) => p.user.id === userId)
    );
  },

  // Get booking requests for a session
  getBookingRequests: async (sessionId: number): Promise<BookingRequest[]> => {
    await delay();

    return bookingRequests.filter((r) => r.session_id === sessionId);
  },

  // Get notifications
  getNotifications: async (userId: number): Promise<Notification[]> => {
    await delay();

    return notifications.filter((n) => !n.read).slice(0, 10); // Return last 10 unread notifications
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    await delay();

    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  },

  // Upload material to session
  uploadMaterial: async (
    sessionId: number,
    material: Partial<SessionMaterial>
  ): Promise<SessionMaterial> => {
    await delay();

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const newMaterial: SessionMaterial = {
      id: (session.materials?.length || 0) + 1,
      title: material.title || "",
      type: material.type || "file",
      url: material.url,
      file_name: material.file_name,
      uploaded_by: material.uploaded_by || mockUsers[0],
      uploaded_at: new Date().toISOString(),
    };

    if (!session.materials) {
      session.materials = [];
    }
    session.materials.push(newMaterial);

    return newMaterial;
  },

  // Reset mock data (for testing)
  resetMockData: () => {
    sessions = [];
    bookingRequests = [];
    notifications = [];
    initializeMockData();
  },
};

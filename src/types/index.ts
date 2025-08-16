// User types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: "student" | "instructor" | "admin";
  date_joined: string;
}

// Course types
export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: User;
  price: number;
  duration: number;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  image: string;
  created_at: string;
  updated_at: string;
}

// Enrollment types
export interface Enrollment {
  id: number;
  student: User;
  course: Course;
  enrolled_at: string;
  is_active: boolean;
  withdrawn_at?: string;
}

export interface Session {
  id: number;
  title: string;
  description: string;
  subject: string;
  level: "beginner" | "intermediate" | "advanced";
  date: string; // UTC datetime from backend
  duration: number; // in minutes
  max_participants: number;
  creator: User;
  participants: Participant[];
  status:
    | "pending_approval"
    | "approved"
    | "scheduled"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "expired";
  created_at: string;
  updated_at: string;
  // Additional properties from API response
  is_full?: boolean;
  available_spots?: number;
  can_join?: boolean;
  participant_count?: number;
  // P2P specific properties
  materials?: SessionMaterial[];
  booking_requests?: BookingRequest[];
}

export interface Participant {
  id: number;
  user: User;
  joined_at: string;
  role: "student" | "tutor";
  status: "pending" | "approved" | "rejected";
}

export interface BookingRequest {
  id: number;
  user: User;
  session_id: number;
  requested_at: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
}

export interface SessionMaterial {
  id: number;
  title: string;
  type: "file" | "link" | "note";
  url?: string;
  file_name?: string;
  uploaded_by: User;
  uploaded_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "reminder" | "booking_request" | "session_update" | "general";
  created_at: string;
  read: boolean;
  session_id?: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  username: string;
  role: "instructor" | "student";
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

// Google Auth types
export interface GoogleAuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
  isNewUser?: boolean;
}

export interface GoogleUserData {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  googleId: string;
}

export interface GoogleRegistrationData {
  email: string;
  first_name: string;
  last_name: string;
  google_id: string;
  role: string;
}

// Navigation types
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

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
  date: string;
  max_participants: number;
  creator: User;
  participants: Participant[];
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  // Additional properties from API response
  is_full?: boolean;
  available_spots?: number;
  can_join?: boolean;
  participant_count?: number;
}

export interface Participant {
  id: number;
  user: User;
  joined_at: string;
  role: "student" | "tutor";
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

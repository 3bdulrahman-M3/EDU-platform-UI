// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: "instructor" | "student";
  date_joined: string;
  google_id?: string;
  picture?: string;
}

// Course types
export interface Course {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  instructor?: User;
  student_count?: number;
  enrollment_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Enrollment types
export interface Enrollment {
  id: number;
  student: User;
  course: Course;
  enrolled_at: string;
  withdrawn_at?: string | null;
  is_active?: boolean;
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

// Security utilities for the application

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePasswordStrength = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rate limiting helper (client-side)
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> =
    new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// XSS prevention
export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Secure token storage
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      // In a real application, you might want to encrypt sensitive data
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Failed to store item securely:", error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Failed to retrieve item securely:", error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to remove item securely:", error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Failed to clear storage securely:", error);
    }
  },
};

// Session management
export const sessionManager = {
  startSession: (userData: any): void => {
    const sessionData = {
      user: userData,
      startedAt: Date.now(),
      lastActivity: Date.now(),
    };
    secureStorage.setItem("session", JSON.stringify(sessionData));
  },

  getSession: (): any => {
    const sessionStr = secureStorage.getItem("session");
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      const now = Date.now();
      const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours

      if (now - session.lastActivity > sessionTimeout) {
        this.endSession();
        return null;
      }

      // Update last activity
      session.lastActivity = now;
      secureStorage.setItem("session", JSON.stringify(session));

      return session;
    } catch (error) {
      console.error("Failed to parse session:", error);
      this.endSession();
      return null;
    }
  },

  endSession: (): void => {
    secureStorage.removeItem("session");
    secureStorage.removeItem("authToken");
    secureStorage.removeItem("refreshToken");
    secureStorage.removeItem("user");
  },

  isSessionValid: (): boolean => {
    return this.getSession() !== null;
  },
};

// Secure headers for API requests
export const getSecureHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Temporarily removing security headers that cause CORS issues
    // "X-Content-Type-Options": "nosniff",
    // "X-Frame-Options": "DENY",
    // "X-XSS-Protection": "1; mode=block",
    // "Referrer-Policy": "strict-origin-when-cross-origin",
    // "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };

  // Add CSRF token if available
  const csrfToken = generateCSRFToken();
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  return headers;
};

// Logout and cleanup
export const secureLogout = (): void => {
  sessionManager.endSession();

  // Clear any other sensitive data
  const sensitiveKeys = [
    "authToken",
    "refreshToken",
    "user",
    "session",
    "csrfToken",
  ];

  sensitiveKeys.forEach((key) => {
    secureStorage.removeItem(key);
  });

  // Redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
};

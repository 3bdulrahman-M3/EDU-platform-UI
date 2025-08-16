"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import {
  authAPI,
  setAuthToken,
  setRefreshToken,
  setUser as setUserToStorage,
  getUser,
  getAuthToken,
  isAuthenticated,
} from "@/lib";
import { secureStorage } from "@/lib/security";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        const currentUser = getUser();

        // If we have both token and user data, try to validate the session
        if (token && currentUser) {
          try {
            // Try to get current user from API to validate token
            const response = await authAPI.getCurrentUser();
            if (response) {
              // Token is valid, update user data and set authenticated
              setUser(response);
              setIsAuth(true);
            } else {
              // Token is invalid, clear everything
              logout();
            }
          } catch (error) {
            // API call failed, token might be expired
            logout();
          }
        } else {
          // No token or user data, ensure clean state
          setIsAuth(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsAuth(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User, token: string, refreshToken?: string) => {
    try {
      // Store in localStorage first
      setAuthToken(token);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      setUserToStorage(userData);

      // Update React state
      setUser(userData);
      setIsAuth(true);
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = () => {
    try {
      // Clear from secureStorage (consistent with API)
      secureStorage.removeItem("authToken");
      secureStorage.removeItem("refreshToken");
      secureStorage.removeItem("user");

      // Clear from state immediately
      setUser(null);
      setIsAuth(false);
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, ensure state is cleared
      setUser(null);
      setIsAuth(false);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: isAuth,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

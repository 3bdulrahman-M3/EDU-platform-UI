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
  isAuthenticated,
  getUser,
  setUser as setUserStorage,
  setAuthToken,
  setRefreshToken,
} from "@/lib/api";

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
    const initializeAuth = () => {
      try {
        const authenticated = isAuthenticated();
        const currentUser = getUser();

        setIsAuth(authenticated);
        setUser(currentUser);
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
    setAuthToken(token);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    setUserStorage(userData);

    setUser(userData);
    setIsAuth(true);
  };

  const logout = () => {
    // Clear from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Clear from state
    setUser(null);
    setIsAuth(false);
  };

  const updateUser = (userData: User) => {
    setUserStorage(userData);
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

import { User } from "@/types";
import { secureStorage } from "./security";

// Helper function to get current user from localStorage
export const getCurrentUserFromStorage = (): User | null => {
  const userStr = secureStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Utility functions for token management
export const setAuthToken = (token: string) => {
  secureStorage.setItem("authToken", token);
};

export const setRefreshToken = (refreshToken: string) => {
  secureStorage.setItem("refreshToken", refreshToken);
};

export const getAuthToken = (): string | null => {
  return secureStorage.getItem("authToken");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getUser = (): User | null => {
  return getCurrentUserFromStorage();
};

export const setUser = (user: User) => {
  secureStorage.setItem("user", JSON.stringify(user));
};

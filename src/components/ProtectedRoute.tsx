"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "instructor";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // User is not authenticated, redirect to login
        router.push("/auth/login");
      } else if (requiredRole && user?.role !== requiredRole) {
        // User doesn't have the required role, redirect to appropriate dashboard
        if (user?.role === "instructor") {
          router.push("/instructor");
        } else if (user?.role === "student") {
          router.push("/student");
        } else {
          router.push("/auth/login");
        }
      } else {
        // User is authenticated and has the required role (if any)
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router]);

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has the required role, render children
  return <>{children}</>;
};

export default ProtectedRoute;

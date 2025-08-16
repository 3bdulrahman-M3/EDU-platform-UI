"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Check if user has the required role
    if (user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user's role
      if (user.role === "instructor") {
        router.push("/instructor");
      } else if (user.role === "student") {
        router.push("/student");
      } else {
        router.push("/auth/login");
      }
      return;
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or wrong role (redirect will happen)
  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
};

export default RoleBasedRoute;

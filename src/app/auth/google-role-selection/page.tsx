"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiBookOpen, FiArrowRight, FiUser, FiUsers } from "react-icons/fi";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const GoogleRoleSelectionPage = () => {
  const [selectedRole, setSelectedRole] = useState<
    "student" | "instructor" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    // Get user data from URL params (passed from Google auth)
    const userDataParam = searchParams.get("userData");
    const existingUserParam = searchParams.get("existingUser");

    if (userDataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(userDataParam));
        setUserData(decoded);
        setIsExistingUser(existingUserParam === "true");
        console.log("User data loaded:", decoded);
        console.log("Is existing user:", existingUserParam === "true");
      } catch (error) {
        console.error("Error parsing user data:", error);
        setError("Invalid user data. Please try logging in again.");
      }
    } else {
      setError("No user data found. Please try logging in again.");
    }
  }, [searchParams]);

  const handleRoleSelection = async () => {
    if (!selectedRole || !userData) {
      setError("Please select a role");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("=== GOOGLE ROLE SELECTION DEBUG ===");
      console.log("Selected role:", selectedRole);
      console.log("User data:", userData);
      console.log("Is existing user:", isExistingUser);
      console.log("===================================");

      let response;

      if (isExistingUser) {
        // Existing user - just update their role
        console.log("Updating role for existing user");
        response = await authAPI.updateUserRole({
          email: userData.email,
          role: selectedRole,
        });
      } else {
        // New user - complete registration with role
        console.log("Completing registration for new user");
        response = await authAPI.completeGoogleRegistration({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          google_id: userData.googleId,
          role: selectedRole,
        });
      }

      console.log("=== ROLE SELECTION RESPONSE ===");
      console.log("Response:", response);
      console.log("User data:", response.data.user);
      console.log("===============================");

      // Store auth data using context
      login(
        response.data.user,
        response.data.tokens.access,
        response.data.tokens.refresh
      );

      // Redirect directly to the appropriate dashboard based on role
      setTimeout(() => {
        if (selectedRole === "instructor") {
          router.push("/instructor");
        } else if (selectedRole === "student") {
          router.push("/student");
        } else {
          router.push("/");
        }
      }, 100);
    } catch (err: any) {
      console.error("Role selection error:", err);

      if (err.response?.data) {
        const errorData = err.response.data;

        if (typeof errorData === "object") {
          const fieldErrors = Object.entries(errorData)
            .filter(([key, value]) => Array.isArray(value) && value.length > 0)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value[0] : value}`
            )
            .join(", ");

          if (fieldErrors) {
            setError(fieldErrors);
            return;
          }
        }

        if (errorData.message) {
          setError(errorData.message);
        } else if (errorData.error) {
          setError(errorData.error);
        } else if (typeof errorData === "string") {
          setError(errorData);
        } else {
          setError("Role selection failed. Please try again.");
        }
      } else {
        setError("Role selection failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 mb-8 group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-200">
                <FiBookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-heading font-bold text-primary-500 group-hover:text-primary-600 transition-colors duration-200">
                LEARN
              </span>
            </Link>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 mb-8 group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-200">
              <FiBookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-primary-500 group-hover:text-primary-600 transition-colors duration-200">
              LEARN
            </span>
          </Link>

          <h2 className="text-3xl font-bold text-secondary-900 mb-2">
            Choose Your Role
          </h2>
          <p className="text-gray-600">
            {isExistingUser
              ? "Welcome back! Please select your role to complete your profile"
              : "Welcome! Please select how you'd like to use our platform"}
          </p>
        </div>

        {/* User Info */}
        {userData && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              {userData.picture && (
                <img
                  src={userData.picture}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="text-sm text-gray-600">{userData.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Student Option */}
            <button
              onClick={() => setSelectedRole("student")}
              className={`w-full p-6 border-2 rounded-xl transition-all duration-200 ${
                selectedRole === "student"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedRole === "student"
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <FiBookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">Student</h3>
                  <p className="text-sm text-gray-600">
                    Learn from courses and track your progress
                  </p>
                </div>
                {selectedRole === "student" && (
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <FiArrowRight className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>

            {/* Instructor Option */}
            <button
              onClick={() => setSelectedRole("instructor")}
              className={`w-full p-6 border-2 rounded-xl transition-all duration-200 ${
                selectedRole === "instructor"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedRole === "instructor"
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <FiUsers className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">Instructor</h3>
                  <p className="text-sm text-gray-600">
                    Create and manage courses for students
                  </p>
                </div>
                {selectedRole === "instructor" && (
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <FiArrowRight className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span className="text-lg">
                  {isExistingUser
                    ? "Updating your profile..."
                    : "Setting up your account..."}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <span className="text-lg">
                  {isExistingUser ? "Update Profile" : "Continue"}
                </span>
                <FiArrowRight className="w-5 h-5" />
              </div>
            )}
          </button>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiArrowRight className="w-4 h-4 mr-1 rotate-180" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GoogleRoleSelectionPage;

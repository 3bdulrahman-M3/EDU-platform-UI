"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiBookOpen,
  FiArrowRight,
} from "react-icons/fi";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User already authenticated, redirecting to home...");
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Test API connection
  const testAPIConnection = async () => {
    try {
      console.log("Testing API connection...");
      const response = await fetch("http://localhost:8000/api/");
      console.log("API test response:", response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log("API test data:", data);
      }
    } catch (err) {
      console.error("API test error:", err);
    }
  };

  // Debug authentication state
  const debugAuthState = () => {
    console.log("=== AUTH DEBUG ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("localStorage authToken:", localStorage.getItem("authToken"));
    console.log("localStorage user:", localStorage.getItem("user"));
    console.log("==================");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Attempting login with:", { email: formData.email });

      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      console.log("=== LOGIN RESPONSE DEBUG ===");
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Response keys:", Object.keys(response.data));
      console.log("User data in response:", response.data?.user);
      console.log("User role in response:", response.data?.user?.role);
      console.log("User role type:", typeof response.data?.user?.role);
      console.log("User role value:", response.data?.user?.role);
      console.log("===========================");

      // Handle Django response format
      let token, userData;

      if (
        response.data?.tokens &&
        response.data.tokens.access &&
        response.data.user
      ) {
        // Django format: { tokens: { access: "..." }, user: {...} }
        token = response.data.tokens.access;
        userData = response.data.user;
      } else if (response.data?.token && response.data.user) {
        // Alternative format: { token: "...", user: {...} }
        token = response.data.token;
        userData = response.data.user;
      } else if (response.data?.access && response.data.user) {
        // Alternative format: { access: "...", user: {...} }
        token = response.data.access;
        userData = response.data.user;
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Unexpected login response format. Please try again.");
        return;
      }

      if (!token) {
        console.error("No token in response:", response);
        setError("Login response missing token. Please try again.");
        return;
      }

      // Check if user data has role field
      console.log("=== ROLE DETECTION DEBUG ===");
      console.log("User data before role check:", userData);
      console.log("Role field exists:", "role" in userData);
      console.log("Role field value:", userData.role);
      console.log("Role field type:", typeof userData.role);
      console.log("===========================");

      if (!userData.role) {
        console.warn("⚠️ WARNING: User data missing role field!");
        console.warn("User data received:", userData);

        // Try to infer role from email or other fields
        // You can customize this logic based on your backend
        if (userData.email && userData.email.includes("instructor")) {
          userData.role = "instructor";
          console.log("🔧 Auto-assigned role as instructor based on email");
        } else {
          userData.role = "student"; // Default fallback
          console.log("🔧 Auto-assigned role as student (default)");
        }
      } else {
        console.log("✅ Role field found:", userData.role);
      }

      console.log("Final user data to be stored:", userData);

      // Store auth data using context
      login(userData, token, response.data?.tokens?.refresh);

      console.log("Auth data stored, redirecting...");
      console.log("Token:", token);
      console.log("User:", userData);

      // Force a small delay to ensure localStorage is updated
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (err: unknown) {
      console.error("Login error:", err);

      // Handle Django validation errors
      if ((err as any).response?.data) {
        const errorData = (err as any).response.data;

        // Handle field-specific errors
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

        // Handle general error messages
        if (errorData.message) {
          setError(errorData.message);
        } else if (errorData.error) {
          setError(errorData.error);
        } else if (typeof errorData === "string") {
          setError(errorData);
        } else {
          setError(
            "Login failed. Please check your credentials and try again."
          );
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
            Welcome back
          </h2>
          <p className="text-gray-600">
            Sign in to your account to continue learning
          </p>
        </div>

        {/* Debug Buttons */}
        <div className="text-center space-x-4">
          <button
            onClick={testAPIConnection}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Test API Connection
          </button>
          <button
            onClick={debugAuthState}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Debug Auth State
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
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

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-secondary-700"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  placeholder="Enter your email address"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-secondary-700"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
                <div className="absolute inset-y-0 right-0 pr-12 flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded-lg transition-colors duration-200"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-3 block text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer transition-colors duration-200"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span className="text-lg text-gray-950">Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-lg text-gray-950">
                    Sign in to your account
                  </span>
                  <FiArrowRight className="w-5 h-5 text-gray-950" />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="ml-2">Google</span>
            </button>
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
              <span className="ml-2">Twitter</span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-700 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary-700 hover:text-primary-800 font-semibold transition-colors duration-200 hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiArrowRight className="w-4 h-4 mr-1 rotate-180" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

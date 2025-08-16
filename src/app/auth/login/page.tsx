"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiBookOpen,
  FiArrowRight,
} from "react-icons/fi";
import { authAPI } from "@/lib";
import { useAuth } from "@/contexts/AuthContext";
import { handleGoogleLogin } from "@/lib/googleAuth";

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

  // Handle Google login
  const handleGoogleSuccess = async (credential: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("=== GOOGLE LOGIN DEBUG ===");
      console.log("Google credential received");

      // First, try to authenticate with Google
      const response = await authAPI.googleAuth(credential);

      console.log("Google auth response:", response);

      if (response.data.isNewUser) {
        // New user - redirect to role selection
        const userData = await handleGoogleLogin(credential);
        const userDataParam = encodeURIComponent(JSON.stringify(userData));
        router.push(`/auth/google-role-selection?userData=${userDataParam}`);
      } else {
        // Existing user - check if they have a role
        const user = response.data.user;
        console.log("Existing user data:", user);
        console.log("User role:", user.role);

        if (
          !user.role ||
          user.role === "" ||
          user.role === null ||
          user.role === undefined
        ) {
          // User exists but has no role - redirect to role selection
          console.log(
            "User exists but has no role, redirecting to role selection"
          );
          const userData = await handleGoogleLogin(credential);
          const userDataParam = encodeURIComponent(JSON.stringify(userData));
          router.push(
            `/auth/google-role-selection?userData=${userDataParam}&existingUser=true`
          );
        } else {
          // User exists and has a role - login directly
          console.log("User exists and has role, logging in directly");

          // Store auth data using context
          login(
            response.data.user,
            response.data.tokens.access,
            response.data.tokens.refresh
          );

          // Redirect directly to the appropriate dashboard based on role
          setTimeout(() => {
            if (user.role === "instructor") {
              router.push("/instructor");
            } else if (user.role === "student") {
              router.push("/student");
            } else {
              router.push("/");
            }
          }, 100);
        }
      }
    } catch (err: unknown) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Google login error occurred");
    setError("Google login failed. Please try again.");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
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

      // Check localStorage immediately after login
      console.log("=== IMMEDIATE STORAGE CHECK ===");
      console.log(
        "Auth token:",
        localStorage.getItem("authToken") ? "exists" : "null"
      );
      console.log(
        "User data:",
        localStorage.getItem("user") ? "exists" : "null"
      );
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log("User role:", user.role);
          console.log("User ID:", user.id);
        } catch (error) {
          console.log("Error parsing user data:", error);
        }
      }
      console.log("==============================");

      // Force a small delay to ensure localStorage is updated
      setTimeout(() => {
        console.log("=== BEFORE REDIRECT CHECK ===");
        console.log(
          "Auth token:",
          localStorage.getItem("authToken") ? "exists" : "null"
        );
        console.log(
          "User data:",
          localStorage.getItem("user") ? "exists" : "null"
        );
        console.log("=============================");
        router.push("/");
      }, 100);
    } catch (err: unknown) {
      console.error("Login error:", err);

      // Handle Django validation errors
      if (err && typeof err === "object" && "response" in err) {
        const errorResponse = err as { response?: { data?: unknown } };
        const errorData = errorResponse.response?.data;

        // Handle field-specific errors
        if (errorData && typeof errorData === "object" && errorData !== null) {
          const errorObj = errorData as Record<string, unknown>;
          const fieldErrors = Object.entries(errorObj)
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
        if (errorData && typeof errorData === "object" && errorData !== null) {
          const errorObj = errorData as Record<string, unknown>;
          if (errorObj.message) {
            setError(String(errorObj.message));
          } else if (errorObj.error) {
            setError(String(errorObj.error));
          } else {
            setError(
              "Login failed. Please check your credentials and try again."
            );
          }
        } else if (typeof errorData === "string") {
          setError(errorData);
        } else {
          setError("Login failed. Please try again.");
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

          {/* Google Login Button */}
          <div className="mt-6">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  handleGoogleSuccess(credentialResponse.credential);
                }
              }}
              onError={() => {
                console.log("Google login error occurred");
                handleGoogleError();
              }}
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
              cancel_on_tap_outside={true}
            />
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

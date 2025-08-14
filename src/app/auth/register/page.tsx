"use client";

import { useState } from "react";
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
  FiUser,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { handleGoogleLogin, testGoogleToken } from "@/lib/googleAuth";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    username: "",
    role: "student" as "student" | "instructor",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  // Handle Google registration
  const handleGoogleSuccess = async (credential: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("=== GOOGLE REGISTRATION DEBUG ===");
      console.log("Google credential received");
      console.log("Credential length:", credential.length);
      console.log(
        "Environment check - GOOGLE_CLIENT_ID:",
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Set" : "NOT SET"
      );
      console.log(
        "Environment check - API_URL:",
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      );

      // Test the Google token first
      const tokenTest = testGoogleToken(credential);
      if (!tokenTest.isValid) {
        throw new Error(`Invalid Google token: ${tokenTest.error}`);
      }

      // First, try to authenticate with Google
      const response = await authAPI.googleAuth(credential);

      console.log("=== GOOGLE AUTH RESPONSE DEBUG ===");
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Is new user:", response.data.isNewUser);
      console.log("Is new user type:", typeof response.data.isNewUser);
      console.log("User data:", response.data.user);
      console.log("User role:", response.data.user?.role);
      console.log("Response keys:", Object.keys(response.data));
      console.log("==================================");

      if (response.data.isNewUser === true) {
        // New user - redirect to role selection
        console.log(
          "=== NEW USER DETECTED - REDIRECTING TO ROLE SELECTION ==="
        );
        try {
          const userData = await handleGoogleLogin(credential);
          console.log("User data for role selection:", userData);
          const userDataParam = encodeURIComponent(JSON.stringify(userData));
          console.log("Encoded user data param:", userDataParam);
          console.log(
            "Redirecting to:",
            `/auth/google-role-selection?userData=${userDataParam}`
          );
          router.push(`/auth/google-role-selection?userData=${userDataParam}`);
        } catch (redirectError: unknown) {
          console.error(
            "Error during redirect to role selection:",
            redirectError
          );
          setError("Error redirecting to role selection. Please try again.");
        }
      } else {
        // Existing user - check if they have a role
        console.log("=== EXISTING USER DETECTED - CHECKING ROLE ===");
        const user = response.data.user;
        console.log("User data:", user);
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
          try {
            const userData = await handleGoogleLogin(credential);
            const userDataParam = encodeURIComponent(JSON.stringify(userData));
            router.push(
              `/auth/google-role-selection?userData=${userDataParam}&existingUser=true`
            );
          } catch (redirectError: unknown) {
            console.error(
              "Error during redirect to role selection:",
              redirectError
            );
            setError("Error redirecting to role selection. Please try again.");
          }
        } else {
          // User exists and has a role - login directly
          console.log("User exists and has role, logging in directly");
          try {
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
          } catch (loginError: unknown) {
            console.error("Error during login:", loginError);
            setError("Error logging in. Please try again.");
          }
        }
      }
    } catch (err: any) {
      console.error("Google registration error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: err.config?.url,
      });

      // Show the specific error message from the API
      setError(err.message || "Google registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google registration failed. Please try again.");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    // Validation
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirm_password ||
      !formData.first_name ||
      !formData.last_name ||
      !formData.username ||
      !formData.role
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("=== REGISTRATION DEBUG ===");
      console.log("Form data being sent:", formData);
      console.log("Role value:", formData.role);
      console.log("Role type:", typeof formData.role);
      console.log("==========================");

      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        role: formData.role,
      });

      console.log("=== REGISTRATION RESPONSE ===");
      console.log("Response:", response);
      console.log("Response data:", response.data);
      console.log("User data:", response.data?.user);
      console.log("User role:", response.data?.user?.role);
      console.log("=============================");

      // Store auth data using context
      login(
        response.data.user,
        response.data.tokens.access,
        response.data.tokens.refresh
      );

      // Redirect to home page
      router.push("/");
    } catch (err: any) {
      console.error("Registration error:", err);

      // Handle Django validation errors
      if (err.response?.data) {
        const errorData = err.response.data;

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
            "Registration failed. Please check your input and try again."
          );
        }
      } else {
        setError("Registration failed. Please try again.");
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
            Create your account
          </h2>
          <p className="text-gray-600">
            Join thousands of learners and start your journey today
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-xl shadow-large p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                <p className="text-error-700 text-sm">{error}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUserCheck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="johndoe"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                I want to join as
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUsers className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 bg-white"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
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
                  <span className="text-lg text-gray-950">
                    Creating account...
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-lg text-gray-950">
                    Create your account
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

          {/* Google Registration Button */}
          <div className="mt-6">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                console.log("Google login success:", credentialResponse);
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
              text="signup_with"
              shape="rectangular"
              width="100%"
              cancel_on_tap_outside={true}
              context="signup"
            />
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700 font-medium">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-primary-700 hover:text-primary-800 transition-colors duration-200 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

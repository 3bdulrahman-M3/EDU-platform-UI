"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  FiBookOpen,
  FiUsers,
  FiAward,
  FiArrowRight,
  FiPlay,
  FiCheckCircle,
} from "react-icons/fi";

const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      console.log("=== ROLE REDIRECT DEBUG ===");
      console.log("User:", user);
      console.log("User role:", user.role);
      console.log("Is authenticated:", isAuthenticated);
      console.log("==========================");

      setRedirecting(true);

      // Add a small delay to ensure all data is loaded
      setTimeout(() => {
        if (user.role === "instructor") {
          console.log("Redirecting to instructor dashboard...");
          router.push("/instructor");
        } else if (user.role === "student") {
          console.log("Redirecting to student dashboard...");
          router.push("/student");
        } else {
          console.warn("Unknown role, staying on home page");
          setRedirecting(false);
        }
      }, 500);
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">
            {redirecting ? "Redirecting to your dashboard..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        {/* Navigation */}
        <nav className="container-custom py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-200">
                <FiBookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-heading font-bold text-primary-500 group-hover:text-primary-600 transition-colors duration-200">
                LEARN
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container-custom py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
              Learn, Grow, and
              <span className="text-primary-600"> Succeed</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join our comprehensive learning platform designed for both
              students and instructors. Discover courses, share knowledge, and
              achieve your educational goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/login"
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 inline-flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container-custom py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive features designed for modern education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBookOpen className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Comprehensive Courses
              </h3>
              <p className="text-gray-600">
                Access a wide range of courses created by expert instructors
                across various subjects and skill levels.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUsers className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Expert Instructors
              </h3>
              <p className="text-gray-600">
                Learn from qualified instructors who are passionate about
                sharing their knowledge and expertise.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiAward className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Flexible Learning
              </h3>
              <p className="text-gray-600">
                Study at your own pace with flexible scheduling and self-paced
                learning options.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container-custom py-20">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of learners and instructors on our platform
            </p>
            <Link
              href="/auth/register"
              className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <span>Get Started Today</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container-custom">
            <div className="text-center">
              <p className="text-gray-400">
                © 2024 LEARN Platform. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Show loading for authenticated users while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default HomePage;

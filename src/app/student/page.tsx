"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiBookOpen,
  FiSearch,
  FiTrendingUp,
  FiPlay,
  FiAward,
} from "react-icons/fi";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import { studentAPI } from "@/lib/api";
import { Enrollment } from "@/types";
import CourseCard from "@/components/CourseCard";
import { useAuth } from "@/contexts/AuthContext";

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true);
      const data = await studentAPI.getMyEnrolledCourses();
      setEnrolledCourses(data);
    } catch (err) {
      setError("Failed to load enrolled courses");
      console.error("Error fetching enrolled courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: "Enrolled Courses",
      value: enrolledCourses.length,
      icon: FiBookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Learning",
      value: enrolledCourses.filter((course) => !course.withdrawn_at).length,
      icon: FiTrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  if (isLoading) {
    return (
      <RoleBasedRoute allowedRoles={["student"]}>
        <div className="min-h-screen bg-gray-50">
          <div className="container-custom py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </RoleBasedRoute>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={["student"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📚 Student Dashboard
              </h1>
              <p className="text-gray-600">
                Track your learning progress and discover new courses
              </p>
            </div>
            <Link
              href="/courses"
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <FiSearch className="w-4 h-4" />
              <span>Discover Courses</span>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiPlay className="w-5 h-5 mr-2 text-blue-600" />
              Learning Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/courses"
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <FiSearch className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Browse Courses
                    </h3>
                    <p className="text-sm text-gray-600">
                      Find new courses to enroll in
                    </p>
                  </div>
                </div>
              </Link>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiBookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">My Courses</h3>
                    <p className="text-sm text-gray-600">
                      Continue your enrolled courses
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiAward className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Progress</h3>
                    <p className="text-sm text-gray-600">
                      Track your learning progress
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enrolled Courses Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Enrolled Courses
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Continue learning from where you left off
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="btn-outline flex items-center space-x-2"
                >
                  <FiSearch className="w-4 h-4" />
                  <span>Find More</span>
                </Link>
              </div>
            </div>

            {error ? (
              <div className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={fetchEnrolledCourses} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiBookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No enrolled courses yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your learning journey by enrolling in courses
                </p>
                <Link
                  href="/courses"
                  className="btn-primary inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <FiSearch className="w-4 h-4 mr-2" />
                  Browse Available Courses
                </Link>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((enrollment) => (
                    <CourseCard
                      key={enrollment.id}
                      course={enrollment.course}
                      isEnrolled={true}
                      onAction={fetchEnrolledCourses}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
};

export default StudentDashboard;

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiBookOpen,
  FiUsers,
  FiTrendingUp,
  FiEdit3,
  FiEye,
} from "react-icons/fi";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import { instructorAPI } from "@/lib";
import { Course } from "@/types";
import CourseCard from "@/components/CourseCard";
import { useAuth } from "@/contexts/AuthContext";

const InstructorDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageStudents: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching instructor data...");

      const coursesData = await instructorAPI.getMyCourses();
      console.log("Instructor courses received:", coursesData);
      setCourses(coursesData);

      // Calculate statistics
      const totalStudents = coursesData.reduce(
        (sum, course) => sum + (course.enrollment_count || 0),
        0
      );
      setStats({
        totalCourses: coursesData.length,
        totalStudents,
        averageStudents:
          coursesData.length > 0
            ? Math.round(totalStudents / coursesData.length)
            : 0,
      });
    } catch (err) {
      console.error("Error fetching instructor data:", err);
      setError(
        "Failed to load your courses. This might be due to a backend issue."
      );
      // Set empty arrays to prevent further errors
      setCourses([]);
      setStats({ totalCourses: 0, totalStudents: 0, averageStudents: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    {
      title: "Total Courses",
      value: courses.length,
      icon: FiBookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Students",
      value: courses.reduce(
        (acc, course) => acc + (course.student_count || 0),
        0
      ),
      icon: FiUsers,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Enrollments",
      value: courses.reduce(
        (acc, course) => acc + (course.enrollment_count || 0),
        0
      ),
      icon: FiTrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  if (isLoading) {
    return (
      <RoleBasedRoute allowedRoles={["instructor"]}>
        <div className="min-h-screen bg-gray-50">
          <div className="container-custom py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
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
    <RoleBasedRoute allowedRoles={["instructor"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎓 Instructor Dashboard
              </h1>
              <p className="text-gray-600">
                Create and manage your courses, track student progress
              </p>
            </div>
            <Link
              href="/instructor/courses/create"
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create New Course</span>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 mb-8 border border-primary-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiEdit3 className="w-5 h-5 mr-2 text-primary-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/instructor/courses/create"
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <FiPlus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Create Course</h3>
                    <p className="text-sm text-gray-600">
                      Add a new course to your portfolio
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/courses"
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <FiEye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Browse All Courses
                    </h3>
                    <p className="text-sm text-gray-600">
                      View all available courses
                    </p>
                  </div>
                </div>
              </Link>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Manage Students
                    </h3>
                    <p className="text-sm text-gray-600">
                      View student enrollments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statsData.map((stat, index) => {
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

          {/* Courses Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Created Courses
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Courses you've created and are managing
                  </p>
                </div>
                <Link
                  href="/instructor/courses/create"
                  className="btn-outline flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Course</span>
                </Link>
              </div>
            </div>

            {error ? (
              <div className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={fetchData} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : courses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiBookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No courses created yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your teaching journey by creating your first course
                </p>
                <Link
                  href="/instructor/courses/create"
                  className="btn-primary inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Create Your First Course
                </Link>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isInstructor={true}
                      onAction={fetchData}
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

export default InstructorDashboard;

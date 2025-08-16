"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiBookOpen,
  FiSearch,
  FiTrendingUp,
  FiPlay,
  FiAward,
  FiUserX,
  FiRefreshCw,
} from "react-icons/fi";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import { studentAPI } from "@/lib";
import { Enrollment } from "@/types";
import CourseCard from "@/components/CourseCard";
import { useAuth } from "@/contexts/AuthContext";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState<"active" | "withdrawn">("active");
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [withdrawnCourses, setWithdrawnCourses] = useState<Enrollment[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let allData: Enrollment[] = [];

      try {
        // Fetch all enrollments for the student
        allData = await studentAPI.getAllMyEnrollments();
      } catch (apiError) {
        console.error("API Error:", apiError);
        // Check if it's a connection error
        if (
          apiError &&
          typeof apiError === "object" &&
          "code" in apiError &&
          apiError.code === "ERR_NETWORK"
        ) {
          setError(
            "Backend server is not running. Please start your backend server on port 8000."
          );
        } else {
          setError("Failed to load enrolled courses. Please try again later.");
        }
        setIsLoading(false);
        return;
      }

      console.log("=== STUDENT DASHBOARD DEBUG ===");
      console.log("All enrollments data:", allData);

      setAllEnrollments(allData);

      // Separate active and withdrawn courses
      const active = allData.filter((enrollment) => !enrollment.withdrawn_at);
      const withdrawn = allData.filter((enrollment) => enrollment.withdrawn_at);

      console.log("Active courses:", active);
      console.log("Withdrawn courses:", withdrawn);
      console.log("Active count:", active.length);
      console.log("Withdrawn count:", withdrawn.length);
      console.log("Total count:", allData.length);
      console.log("=== END DEBUG ===");

      // Fallback: if no withdrawn courses found but we have data,
      // check if any enrollments have is_active: false
      if (withdrawn.length === 0 && allData.length > 0) {
        const fallbackActive = allData.filter(
          (enrollment) => enrollment.is_active !== false
        );
        const fallbackWithdrawn = allData.filter(
          (enrollment) => enrollment.is_active === false
        );
        setEnrolledCourses(fallbackActive);
        setWithdrawnCourses(fallbackWithdrawn);
      } else {
        setEnrolledCourses(active);
        setWithdrawnCourses(withdrawn);
      }
    } catch (err) {
      console.error("Error in fetchEnrolledCourses:", err);
      setError("Failed to load enrolled courses");
    } finally {
      setIsLoading(false);
    }
  };

  const activeCourses = enrolledCourses.filter(
    (course) => !course.withdrawn_at
  );
  const withdrawnCoursesList = withdrawnCourses.filter(
    (course) => course.withdrawn_at
  );

  const stats = [
    {
      title: "Active Courses",
      value: activeCourses.length,
      icon: FiBookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Withdrawn Courses",
      value: withdrawnCoursesList.length,
      icon: FiUserX,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Total Enrollments",
      value: activeCourses.length + withdrawnCoursesList.length,
      icon: FiTrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCourseAction = async (
    action: "enroll" | "withdraw",
    courseId: number
  ) => {
    try {
      if (action === "enroll") {
        await studentAPI.enrollInCourse(courseId);
        setSuccessMessage("Successfully enrolled in course!");
      } else {
        await studentAPI.withdrawFromCourse(courseId);
        setSuccessMessage("Successfully withdrawn from course!");
      }
      // Clear any existing errors
      setError(null);
      // Refresh the data after successful action
      await fetchEnrolledCourses();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      // Show user-friendly error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${action} from course`;
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <RoleBasedRoute allowedRoles={["student"]}>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Connection Error
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-y-2">
                <button onClick={fetchEnrolledCourses} className="btn-primary">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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

          {/* Success/Error Notifications */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    My Course Enrollments
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Manage your active and withdrawn course enrollments
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchEnrolledCourses}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                  <Link
                    href="/courses"
                    className="btn-outline flex items-center space-x-2"
                  >
                    <FiSearch className="w-4 h-4" />
                    <span>Find More</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === "active"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FiBookOpen className="w-4 h-4" />
                  <span>Active Courses ({activeCourses.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("withdrawn")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === "withdrawn"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FiUserX className="w-4 h-4" />
                  <span>Withdrawn Courses ({withdrawnCoursesList.length})</span>
                </button>
              </nav>
            </div>

            {/* Course Lists */}
            <div className="p-6">
              {activeTab === "active" ? (
                activeCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No courses enrolled yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start your learning journey by enrolling in courses that
                      interest you.
                    </p>
                    <Link
                      href="/courses"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCourses.map((enrollment) => (
                      <CourseCard
                        key={enrollment.id}
                        course={enrollment.course}
                        user={user!}
                        enrollmentStatus={true}
                        isWithdrawn={false}
                        enrollmentDate={enrollment.enrolled_at}
                        withdrawalDate={enrollment.withdrawn_at || undefined}
                        onAction={() =>
                          handleCourseAction("withdraw", enrollment.course.id)
                        }
                        showActions={true}
                      />
                    ))}
                  </div>
                )
              ) : withdrawnCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUserX className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No withdrawn courses
                  </h3>
                  <p className="text-gray-600">
                    Courses you withdraw from will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {withdrawnCourses.map((enrollment) => (
                    <CourseCard
                      key={enrollment.id}
                      course={enrollment.course}
                      user={user!}
                      enrollmentStatus={false}
                      isWithdrawn={true}
                      enrollmentDate={enrollment.enrolled_at}
                      withdrawalDate={enrollment.withdrawn_at || undefined}
                      onAction={() =>
                        handleCourseAction("enroll", enrollment.course.id)
                      }
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
};

export default StudentDashboard;

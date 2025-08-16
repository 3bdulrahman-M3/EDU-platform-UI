"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiBookOpen, FiPlus } from "react-icons/fi";
import { coursesAPI, studentAPI } from "@/lib";
import { Course, Enrollment } from "@/types";
import CourseCard from "@/components/CourseCard";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching courses...");
      console.log("Current user:", user);

      // Fetch courses based on user role
      if (user?.role === "student") {
        console.log("Fetching as student...");
        const [coursesData, enrolledData] = await Promise.all([
          studentAPI.getNewestCourses(),
          studentAPI.getMyEnrolledCourses(),
        ]);
        setCourses(coursesData);
        setEnrolledCourses(enrolledData);
      } else {
        // For instructors or general users, get all courses
        console.log("Fetching as instructor/general user...");
        const coursesData = await coursesAPI.getAllCourses();
        setCourses(coursesData);
        setEnrolledCourses([]);
      }

      console.log("Courses data received:", courses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again later.");
      // Set empty arrays to prevent further errors
      setCourses([]);
      setEnrolledCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = courses;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // For students, exclude courses they're already enrolled in
    if (user?.role === "student") {
      const enrolledCourseIds = enrolledCourses.map(
        (enrollment) => enrollment.course.id
      );
      filtered = filtered.filter(
        (course) => !enrolledCourseIds.includes(course.id)
      );
    }

    setFilteredCourses(filtered);
  }, [searchQuery, courses, enrolledCourses, user?.role]);

  const handleCourseAction = () => {
    // Refresh data after enrollment/withdrawal
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-300 rounded w-full mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-gray-900)" }}>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user?.role === "student" ? "Discover Courses" : "All Courses"}
            </h1>
            <p className="text-gray-600">
              {user?.role === "student"
                ? "Explore the latest courses and start your learning journey"
                : "Browse all available courses"}
            </p>
          </div>
          {user?.role === "instructor" && (
            <Link
              href="/instructor/courses/create"
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Count */}
        {filteredCourses.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No courses found" : "No courses available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : user?.role === "instructor"
                ? "Start by creating your first course"
                : "Check back later for new courses"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn-outline"
                >
                  Clear Search
                </button>
              )}
              {user?.role === "instructor" && !searchQuery && (
                <Link
                  href="/instructor/courses/create"
                  className="btn-primary bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourses.some(
                (enrollment) => enrollment.course.id === course.id
              );

              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={isEnrolled}
                  isInstructor={user?.role === "instructor"}
                  onAction={handleCourseAction}
                  showActions={
                    user?.role === "student" || user?.role === "instructor"
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;

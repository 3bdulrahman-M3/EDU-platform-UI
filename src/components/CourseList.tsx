"use client";

import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiGrid, FiList, FiX } from "react-icons/fi";
import { coursesAPI } from "@/lib";
import { Course } from "@/types";
import CourseCard from "./CourseCard";

interface CourseListProps {
  initialCourses?: Course[];
  showSearch?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

const CourseList = ({
  initialCourses = [],
  showSearch = true,
  title = "All Courses",
  subtitle = "Discover the perfect course for your learning journey",
  className = "",
}: CourseListProps) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [filteredCourses, setFilteredCourses] =
    useState<Course[]>(initialCourses);
  const [loading, setLoading] = useState(!initialCourses.length);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (!hasInitialized && !initialCourses.length) {
      setHasInitialized(true);
      fetchCourses();
    }
  }, [hasInitialized, initialCourses.length]); // Only depend on length, not the array itself

  // Memoize filtered and sorted courses to prevent unnecessary re-computations
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sorting (simplified since we don't have all the fields)
    switch (sortBy) {
      case "newest":
        // Since we don't have created_at, we'll sort by ID (assuming newer courses have higher IDs)
        filtered.sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        filtered.sort((a, b) => a.id - b.id);
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return filtered;
  }, [courses, searchQuery, sortBy]);

  // Update filtered courses when the memoized result changes
  useEffect(() => {
    setFilteredCourses(filteredAndSortedCourses);
  }, [filteredAndSortedCourses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCourses = await coursesAPI.getAllCourses();
      setCourses(fetchedCourses);
    } catch (err) {
      setError("Failed to fetch courses. Please try again later.");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || sortBy !== "newest";

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button onClick={fetchCourses} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      {/* Search and Filters */}
      {showSearch && (
        <div className="bg-white rounded-xl shadow-soft p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for courses or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 py-2 px-3 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white text-primary-600 shadow-soft"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FiGrid className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 py-2 px-3 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white text-primary-600 shadow-soft"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FiList className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    Search: &quot;{searchQuery}&quot;
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-1 hover:text-primary-800"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
      </div>

      {/* Courses Grid/List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria
          </p>
          <button onClick={clearFilters} className="btn-outline">
            Clear Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              className={viewMode === "list" ? "flex-row" : ""}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;

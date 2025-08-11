"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiClock,
  FiUser,
  FiStar,
  FiUsers,
  FiBookOpen,
  FiCheckCircle,
  FiPlay,
  FiDownload,
  FiShare2,
  FiHeart,
} from "react-icons/fi";
import { coursesAPI, Course } from "@/lib/api";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params?.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCourse = await coursesAPI.getCourseById(Number(courseId));
      setCourse(fetchedCourse);
    } catch (err) {
      setError("Failed to fetch course details. Please try again later.");
      console.error("Error fetching course:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    // TODO: Implement enrollment logic
    setIsEnrolled(true);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const shareCourse = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: course?.short_description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-success-100 text-success-700 border-success-200";
      case "intermediate":
        return "bg-warning-100 text-warning-700 border-warning-200";
      case "advanced":
        return "bg-error-100 text-error-700 border-error-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getLevelText = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `$${price}`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={i} className="w-5 h-5 text-accent-500 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <FiStar className="w-5 h-5 text-gray-300" />
          <div className="absolute inset-0 w-2.5 h-5 bg-accent-500 rounded-l-sm"></div>
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FiStar key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="aspect-video bg-gray-300 rounded-lg"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-300 rounded-lg"></div>
                  <div className="h-12 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-red-500 text-lg mb-4">
              {error || "Course not found"}
            </div>
            <Link href="/courses" className="btn-primary">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/courses"
              className="hover:text-primary-600 transition-colors"
            >
              Courses
            </Link>
            <span>/</span>
            <span className="text-gray-900">{course.title}</span>
          </nav>

          {/* Course Header */}
          <div className="bg-white rounded-xl shadow-soft p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor(
                      course.level
                    )}`}
                  >
                    {getLevelText(course.level)}
                  </span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(course.price)}
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-secondary-900 mb-4 leading-tight">
                  {course.title}
                </h1>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-2">
                      <FiClock className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="font-semibold text-secondary-900">
                      {course.duration}h
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-lg mb-2">
                      <FiUsers className="w-6 h-6 text-secondary-600" />
                    </div>
                    <div className="text-sm text-gray-600">Students</div>
                    <div className="font-semibold text-secondary-900">
                      {course.enrolled_students}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-accent-100 rounded-lg mb-2">
                      <FiStar className="w-6 h-6 text-accent-600" />
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                    <div className="font-semibold text-secondary-900">
                      {course.rating.toFixed(1)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mb-2">
                      <FiBookOpen className="w-6 h-6 text-success-600" />
                    </div>
                    <div className="text-sm text-gray-600">Category</div>
                    <div className="font-semibold text-secondary-900">
                      {course.category}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Image */}
              <div className="lg:col-span-1">
                <div className="relative overflow-hidden rounded-lg">
                  <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 relative">
                    {course.image_url ? (
                      <Image
                        src={course.image_url}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center">
                          <FiBookOpen className="w-10 h-10 text-primary-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* What You'll Learn */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                  What you'll learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Master the fundamentals of the subject",
                    "Build real-world projects",
                    "Get certified upon completion",
                    "Access to lifetime updates",
                    "Join a community of learners",
                    "Get support from instructors",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <FiCheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Description */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                  Course Description
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {course.description}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    This comprehensive course is designed to take you from
                    beginner to advanced level, providing hands-on experience
                    and practical knowledge that you can apply immediately in
                    your projects and career.
                  </p>
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                  Instructor
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiUser className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {course.instructor}
                    </h3>
                    <p className="text-gray-600">
                      Expert Instructor & Developer
                    </p>
                    <div className="flex items-center space-x-1 mt-2">
                      {renderStars(4.8)}
                      <span className="ml-2 text-sm text-gray-600">
                        4.8 instructor rating
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Enrollment Card */}
              <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {formatPrice(course.price)}
                  </div>
                  {course.price === 0 && (
                    <div className="text-sm text-gray-500">Free forever</div>
                  )}
                </div>

                <div className="space-y-4">
                  {isEnrolled ? (
                    <button className="w-full btn-secondary">
                      <FiPlay className="w-4 h-4 mr-2" />
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="w-full btn-primary"
                    >
                      <FiBookOpen className="w-4 h-4 mr-2" />
                      Enroll Now
                    </button>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={toggleFavorite}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                        isFavorite
                          ? "border-primary-500 bg-primary-50 text-primary-600"
                          : "border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600"
                      }`}
                    >
                      <FiHeart
                        className={`w-4 h-4 mx-auto ${
                          isFavorite ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={shareCourse}
                      className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-all duration-200"
                    >
                      <FiShare2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    30-Day Money-Back Guarantee
                  </div>
                </div>

                {/* Course Features */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Course includes:</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FiPlay className="w-4 h-4 text-primary-500" />
                      <span>{course.duration} hours on-demand video</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FiDownload className="w-4 h-4 text-primary-500" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FiCheckCircle className="w-4 h-4 text-primary-500" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Summary */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Student Reviews
                </h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-secondary-900 mb-1">
                    {course.rating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {renderStars(course.rating)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {course.enrolled_students} students enrolled
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

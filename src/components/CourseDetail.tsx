"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiBookOpen,
  FiCheckCircle,
  FiPlay,
  FiDownload,
  FiShare2,
  FiHeart,
} from "react-icons/fi";
import { coursesAPI } from "@/lib/api";
import { Course } from "@/types";

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
        text: course?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
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
                <h1 className="text-4xl font-bold text-secondary-900 mb-4 leading-tight">
                  {course.title}
                </h1>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Course Image */}
              <div className="lg:col-span-1">
                <div className="relative overflow-hidden rounded-lg">
                  <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 relative">
                    {course.image ? (
                      <Image
                        src={course.image}
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
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Enrollment Card */}
              <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    Free
                  </div>
                  <div className="text-sm text-gray-500">Free forever</div>
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
                      <span>On-demand video content</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

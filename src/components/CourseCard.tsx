"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiUsers,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";
import { Course, User } from "@/types";
import { studentAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface CourseCardProps {
  course: Course;
  className?: string;
  isEnrolled?: boolean;
  isInstructor?: boolean;
  onAction?: () => void;
  showActions?: boolean;
}

const CourseCard = ({
  course,
  className = "",
  isEnrolled = false,
  isInstructor = false,
  onAction,
  showActions = true,
}: CourseCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(isEnrolled);
  const { user } = useAuth();

  const handleEnroll = async () => {
    if (!user || user.role !== "student") return;

    try {
      setIsLoading(true);
      await studentAPI.enrollInCourse(course.id);
      setEnrollmentStatus(true);
      onAction?.();
    } catch (error) {
      console.error("Failed to enroll:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || user.role !== "student") return;

    try {
      setIsLoading(true);
      await studentAPI.withdrawFromCourse(course.id);
      setEnrollmentStatus(false);
      onAction?.();
    } catch (error) {
      console.error("Failed to withdraw:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionButton = () => {
    if (!showActions || !user) return null;

    if (user.role === "instructor" && isInstructor) {
      return (
        <div className="flex space-x-2">
          <Link
            href={`/instructor/courses/${course.id}/students`}
            className="flex-1 btn-secondary flex items-center justify-center space-x-2"
          >
            <FiUsers className="w-4 h-4" />
            <span>View Students</span>
          </Link>
        </div>
      );
    }

    if (user.role === "student") {
      if (enrollmentStatus) {
        return (
          <button
            onClick={handleWithdraw}
            disabled={isLoading}
            className="w-full btn-outline flex items-center justify-center space-x-2 text-red-600 border-red-600 hover:bg-red-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
            ) : (
              <FiUserX className="w-4 h-4" />
            )}
            <span>{isLoading ? "Withdrawing..." : "Withdraw"}</span>
          </button>
        );
      } else {
        return (
          <button
            onClick={handleEnroll}
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <FiUserCheck className="w-4 h-4" />
            )}
            <span>{isLoading ? "Enrolling..." : "Enroll"}</span>
          </button>
        );
      }
    }

    // Default view course button for non-enrolled students or general view
    return (
      <Link
        href={`/courses/${course.id}`}
        className="w-full btn-primary flex items-center justify-center space-x-2 group-hover:bg-primary-600"
      >
        <span>View Course</span>
        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
      </Link>
    );
  };

  return (
    <div
      className={`card group hover:shadow-large transition-all duration-300 ${className} ${
        enrollmentStatus ? "ring-2 ring-primary-200" : ""
      }`}
    >
      {/* Course Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 relative">
          {course.image ? (
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center">
                <FiBookOpen className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          )}
        </div>

        {/* Enrollment Status Badge */}
        {enrollmentStatus && (
          <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            Enrolled
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {course.description}
        </p>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        {renderActionButton()}
      </div>
    </div>
  );
};

export default CourseCard;

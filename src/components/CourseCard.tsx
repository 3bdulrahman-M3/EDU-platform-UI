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
  FiEdit,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { Course, User } from "@/types";
import { studentAPI, coursesAPI } from "@/lib";
import { useAuth } from "@/contexts/AuthContext";
import { getCourseImageUrl } from "@/lib/cloudinary";
import { useRouter } from "next/navigation";

interface CourseCardProps {
  course: Course;
  className?: string;
  isEnrolled?: boolean;
  isInstructor?: boolean;
  onAction?: () => void;
  showActions?: boolean;
  isWithdrawn?: boolean;
  enrollmentDate?: string;
  withdrawalDate?: string;
}

const CourseCard = ({
  course,
  className = "",
  isEnrolled = false,
  isInstructor = false,
  onAction,
  showActions = true,
  isWithdrawn = false,
  enrollmentDate,
  withdrawalDate,
}: CourseCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(isEnrolled);
  const { user } = useAuth();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await coursesAPI.deleteCourse(course.id);
      setShowDeleteModal(false);
      onAction?.();
    } catch (error) {
      console.error("Failed to delete course:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      if (isWithdrawn) {
        return (
          <div className="flex flex-col space-y-2">
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full text-center">
              Withdrawn
            </span>
            <button
              onClick={onAction}
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <FiUserCheck className="w-4 h-4" />
              )}
              <span>{isLoading ? "Re-enrolling..." : "Re-enroll"}</span>
            </button>
            <Link
              href={`/courses/${course.id}`}
              className="w-full btn-outline flex items-center justify-center space-x-2"
            >
              <span>View Course</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        );
      }

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

  const renderInstructorActions = () => (
    <div className="flex space-x-2 mt-2">
      <Link
        href={`/courses/${course.id}/edit`}
        className="btn-outline flex items-center space-x-1 border-accent-500 text-accent-500 hover:bg-accent-900 hover:text-white px-3 py-2 text-sm"
      >
        <FiEdit className="w-4 h-4" />
        <span>Edit</span>
      </Link>
      <button
        onClick={() => setShowDeleteModal(true)}
        className="btn-outline flex items-center space-x-1 border-error-700 text-error-700 hover:bg-error-900 hover:text-white px-3 py-2 text-sm"
      >
        <FiTrash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  );

  return (
    <div
      className={`card group hover:shadow-large transition-all duration-300 ${className} ${
        enrollmentStatus ? "ring-2 ring-accent-700" : ""
      } ${isWithdrawn ? "opacity-75" : ""}`}
      style={{ backgroundColor: "var(--color-gray-900)" }}
    >
      {/* Course Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <div className="aspect-video bg-gradient-to-br from-primary-900 to-accent-900 relative">
          {course.image ? (
            <Image
              src={getCourseImageUrl(course.image, 400, 225)}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center">
                <FiBookOpen className="w-8 h-8 text-accent-500" />
              </div>
            </div>
          )}
        </div>

        {/* Enrollment Status Badge */}
        {enrollmentStatus && !isWithdrawn && (
          <div className="absolute top-2 right-2 bg-accent-700 text-white px-2 py-1 rounded-full text-xs font-medium">
            Enrolled
          </div>
        )}
        {isWithdrawn && (
          <div className="absolute top-2 right-2 bg-error-700 text-white px-2 py-1 rounded-full text-xs font-medium">
            Withdrawn
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-100 group-hover:text-accent-500 transition-colors duration-200 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        {/* Enrollment/Withdrawal Dates */}
        {(enrollmentDate || withdrawalDate) && (
          <div className="text-xs text-gray-500 space-y-1">
            {enrollmentDate && (
              <div className="flex items-center space-x-1">
                <FiUserCheck className="w-3 h-3" />
                <span>Enrolled: {formatDate(enrollmentDate)}</span>
              </div>
            )}
            {withdrawalDate && (
              <div className="flex items-center space-x-1">
                <FiUserX className="w-3 h-3" />
                <span>Withdrawn: {formatDate(withdrawalDate)}</span>
              </div>
            )}
          </div>
        )}
        {/* Responsive Show Details Button */}
        <div className="flex w-full">
          <Link
            href={`/courses/${course.id}`}
            className="btn-primary w-full flex items-center justify-center space-x-2 mt-2 md:mt-0"
          >
            <span>Show Details</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {/* Instructor Actions */}
        {user?.role === "instructor" && isInstructor && renderInstructorActions()}
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        {renderActionButton()}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900 opacity-80" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-secondary-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-error-900 mb-6">
                <FiTrash2 className="h-8 w-8 text-error-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Confirm Delete</h3>
              <p className="text-gray-400 mb-8">Are you sure you want to delete this course? This action cannot be undone.</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 text-gray-200 bg-gray-800 hover:bg-gray-700 font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-error-700 hover:bg-error-800 text-white font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;

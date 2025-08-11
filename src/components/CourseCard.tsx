"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FiClock,
  FiUser,
  FiStar,
  FiUsers,
  FiArrowRight,
  FiBookOpen,
} from "react-icons/fi";
import { Course } from "@/lib/api";

interface CourseCardProps {
  course: Course;
  className?: string;
}

const CourseCard = ({ course, className = "" }: CourseCardProps) => {
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
        <FiStar key={i} className="w-4 h-4 text-accent-500 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <FiStar className="w-4 h-4 text-gray-300" />
          <div className="absolute inset-0 w-2 h-4 bg-accent-500 rounded-l-sm"></div>
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FiStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div
      className={`card group hover:shadow-large transition-all duration-300 ${className}`}
    >
      {/* Course Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 relative">
          {course.image_url ? (
            <Image
              src={course.image_url}
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

        {/* Level Badge */}
        <div
          className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(
            course.level
          )}`}
        >
          {getLevelText(course.level)}
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-white rounded-full text-sm font-bold text-primary-600 shadow-soft">
          {formatPrice(course.price)}
        </div>
      </div>

      {/* Course Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {course.short_description || course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FiUser className="w-4 h-4" />
          <span>{course.instructor}</span>
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <FiClock className="w-4 h-4" />
              <span>{course.duration}h</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiUsers className="w-4 h-4" />
              <span>{course.enrolled_students}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            {renderStars(course.rating)}
            <span className="ml-1 font-medium text-gray-700">
              {course.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="inline-block px-3 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded-full">
          {course.category}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          href={`/courses/${course.id}`}
          className="w-full btn-primary flex items-center justify-center space-x-2 group-hover:bg-primary-600"
        >
          <span>View Course</span>
          <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;

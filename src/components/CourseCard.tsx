"use client";

import Link from "next/link";
import Image from "next/image";
import { FiArrowRight, FiBookOpen } from "react-icons/fi";
import { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  className?: string;
}

const CourseCard = ({ course, className = "" }: CourseCardProps) => {
  return (
    <div
      className={`card group hover:shadow-large transition-all duration-300 ${className}`}
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

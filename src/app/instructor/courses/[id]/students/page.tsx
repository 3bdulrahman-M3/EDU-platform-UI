"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiUsers, FiUserX, FiCalendar } from "react-icons/fi";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import { instructorAPI } from "@/lib/api";
import { Enrollment } from "@/types";
import Link from "next/link";

const CourseStudents = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const [activeTab, setActiveTab] = useState<"enrolled" | "withdrawn">(
    "enrolled"
  );
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([]);
  const [withdrawnStudents, setWithdrawnStudents] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchStudents();
    }
  }, [courseId, activeTab]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (activeTab === "enrolled") {
        const data = await instructorAPI.getCourseStudents(courseId);
        setEnrolledStudents(data);
      } else {
        const data = await instructorAPI.getWithdrawnStudents(courseId);
        setWithdrawnStudents(data);
      }
    } catch (err) {
      setError("Failed to load students");
      console.error("Error fetching students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const StudentCard = ({ enrollment }: { enrollment: Enrollment }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-primary-600 font-semibold text-lg">
            {enrollment.student.first_name.charAt(0)}
            {enrollment.student.last_name.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            {enrollment.student.first_name} {enrollment.student.last_name}
          </h3>
          <p className="text-sm text-gray-600">{enrollment.student.email}</p>
          <div className="flex items-center space-x-1 mt-1">
            <FiCalendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {activeTab === "enrolled" ? "Enrolled" : "Withdrawn"} on{" "}
              {formatDate(enrollment.enrolled_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <RoleBasedRoute allowedRoles={["instructor"]}>
        <div className="min-h-screen bg-gray-50">
          <div className="container-custom py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
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
          <div className="mb-8">
            <Link
              href="/instructor"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Course Students
            </h1>
            <p className="text-gray-600">
              Manage and view students for course #{courseId}
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("enrolled")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === "enrolled"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FiUsers className="w-4 h-4" />
                  <span>Enrolled Students ({enrolledStudents.length})</span>
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
                  <span>Withdrawn Students ({withdrawnStudents.length})</span>
                </button>
              </nav>
            </div>

            <div className="p-6">
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button onClick={fetchStudents} className="btn-primary">
                    Try Again
                  </button>
                </div>
              ) : activeTab === "enrolled" ? (
                enrolledStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiUsers className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No enrolled students
                    </h3>
                    <p className="text-gray-600">
                      Students will appear here once they enroll in your course
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledStudents.map((enrollment) => (
                      <StudentCard
                        key={enrollment.id}
                        enrollment={enrollment}
                      />
                    ))}
                  </div>
                )
              ) : withdrawnStudents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUserX className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No withdrawn students
                  </h3>
                  <p className="text-gray-600">
                    Students who withdraw will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {withdrawnStudents.map((enrollment) => (
                    <StudentCard key={enrollment.id} enrollment={enrollment} />
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

export default CourseStudents;

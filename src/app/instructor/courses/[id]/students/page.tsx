"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiUsers,
  FiUserX,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import { instructorAPI } from "@/lib";
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
  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>("");

  useEffect(() => {
    if (courseId) {
      fetchStudents();
    }
  }, [courseId]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let allData: Enrollment[] = [];

      try {
        // Fetch all enrollments for the course
        allData = await instructorAPI.getAllCourseEnrollments(courseId);
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
          setError("Failed to load students. Please try again later.");
        }
        setIsLoading(false);
        return;
      }

      console.log("=== INSTRUCTOR DASHBOARD DEBUG ===");
      console.log("All enrollments data:", allData);
      console.log("Course ID:", courseId);

      setAllEnrollments(allData);

      // Separate active and withdrawn students
      const active = allData.filter((enrollment) => !enrollment.withdrawn_at);
      const withdrawn = allData.filter((enrollment) => enrollment.withdrawn_at);

      console.log("Active students:", active);
      console.log("Withdrawn students:", withdrawn);
      console.log("Active count:", active.length);
      console.log("Withdrawn count:", withdrawn.length);
      console.log("Total count:", allData.length);
      console.log("=== END DEBUG ===");

      // Fallback: if no withdrawn students found but we have data,
      // check if any enrollments have is_active: false
      if (withdrawn.length === 0 && allData.length > 0) {
        const fallbackActive = allData.filter(
          (enrollment) => enrollment.is_active !== false
        );
        const fallbackWithdrawn = allData.filter(
          (enrollment) => enrollment.is_active === false
        );
        setEnrolledStudents(fallbackActive);
        setWithdrawnStudents(fallbackWithdrawn);
      } else {
        setEnrolledStudents(active);
        setWithdrawnStudents(withdrawn);
      }
    } catch (err) {
      console.error("Error in fetchStudents:", err);
      setError("Failed to load students");
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

  const getStudentStatus = (enrollment: Enrollment) => {
    if (enrollment.withdrawn_at) {
      return {
        status: "Withdrawn",
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-200",
      };
    }
    return {
      status: "Active",
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-200",
    };
  };

  const StudentCard = ({ enrollment }: { enrollment: Enrollment }) => {
    const status = getStudentStatus(enrollment);

    return (
      <div
        className={`bg-white p-4 rounded-lg border ${status.borderColor} hover:shadow-sm transition-shadow`}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-lg">
              {enrollment.student.first_name.charAt(0)}
              {enrollment.student.last_name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  {enrollment.student.first_name} {enrollment.student.last_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {enrollment.student.email}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
              >
                {status.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <FiCalendar className="w-3 h-3" />
                <span>Enrolled: {formatDate(enrollment.enrolled_at)}</span>
              </div>
              {enrollment.withdrawn_at && (
                <div className="flex items-center space-x-1">
                  <FiUserX className="w-3 h-3" />
                  <span>Withdrawn: {formatDate(enrollment.withdrawn_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const exportStudentList = () => {
    const students =
      activeTab === "enrolled" ? enrolledStudents : withdrawnStudents;
    const csvContent = [
      "Name,Email,Status,Enrolled Date,Withdrawn Date",
      ...students.map(
        (student) =>
          `"${student.student.first_name} ${student.student.last_name}","${
            student.student.email
          }","${getStudentStatus(student).status}","${formatDate(
            student.enrolled_at
          )}","${student.withdrawn_at ? formatDate(student.withdrawn_at) : ""}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}_students_course_${courseId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
                <button onClick={fetchStudents} className="btn-primary">
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

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <FiUsers className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrolledStudents.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <FiUserX className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Withdrawn Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {withdrawnStudents.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Enrollments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrolledStudents.length + withdrawnStudents.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between px-6">
                <nav className="flex space-x-8">
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchStudents}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={exportStudentList}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Export to CSV"
                  >
                    <FiDownload className="w-4 h-4" />
                  </button>
                </div>
              </div>
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

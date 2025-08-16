import ProtectedRoute from "@/components/ProtectedRoute";
import CourseDetail from "@/components/CourseDetail";

const CourseDetailPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: "var(--color-gray-900)" }}>
        <div className="container-custom py-12">
          <CourseDetail />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CourseDetailPage;

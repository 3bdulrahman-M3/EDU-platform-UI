import ProtectedRoute from "@/components/ProtectedRoute";
import CourseDetail from "@/components/CourseDetail";

const CourseDetailPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="container-custom py-12">
          <CourseDetail />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CourseDetailPage;

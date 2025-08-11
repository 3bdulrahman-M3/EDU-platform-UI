import ProtectedRoute from "@/components/ProtectedRoute";
import CourseList from "@/components/CourseList";

const CoursesPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="container-custom py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Explore Our Courses
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover a world of knowledge with our carefully curated courses
              designed to help you grow and succeed.
            </p>
          </div>

          <CourseList
            showSearch={true}
            showFilters={true}
            title="All Courses"
            subtitle="Find the perfect course for your learning journey"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CoursesPage;

import ProtectedRoute from "@/components/ProtectedRoute";
import CourseList from "@/components/CourseList";
import { FiBookOpen, FiUsers, FiAward, FiPlay } from "react-icons/fi";

const HomePage = () => {
  return (

      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        {/* Hero Section */}
        <div className="container-custom py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-secondary-900 mb-6">
              Welcome to <span className="text-primary-600">LEARN</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Your gateway to endless learning opportunities. Discover courses
              from world-class instructors and advance your skills at your own
              pace.
            </p>
            <div className="flex items-center justify-center space-x-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <FiUsers className="w-5 h-5" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiBookOpen className="w-5 h-5" />
                <span>500+ Courses</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiAward className="w-5 h-5" />
                <span>Expert Instructors</span>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white rounded-xl p-8 shadow-soft text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPlay className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                Learn at Your Pace
              </h3>
              <p className="text-gray-600">
                Access courses anytime, anywhere. Learn at your own speed with
                lifetime access to all content.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-soft text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                Expert Instructors
              </h3>
              <p className="text-gray-600">
                Learn from industry professionals and experts who are passionate
                about sharing their knowledge.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-soft text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                Get Certified
              </h3>
              <p className="text-gray-600">
                Earn certificates upon completion to showcase your new skills
                and advance your career.
              </p>
            </div>
          </div>

          {/* Featured Courses Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Featured Courses
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Start your learning journey with our most popular and
                highly-rated courses
              </p>
            </div>

            <CourseList
              showSearch={false}
              title=""
              subtitle=""
            />
          </div>
        </div>
      </div>
   
  );
};

export default HomePage;

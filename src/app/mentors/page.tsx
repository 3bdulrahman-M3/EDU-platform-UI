import ProtectedRoute from "@/components/ProtectedRoute";
import { FiUsers, FiStar, FiBookOpen, FiMail } from "react-icons/fi";

const MentorsPage = () => {
  const mentors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      expertise: "Data Science & Machine Learning",
      rating: 4.9,
      students: 2500,
      courses: 12,
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      description:
        "Senior Data Scientist with 10+ years of experience in AI and machine learning.",
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      expertise: "Web Development & React",
      rating: 4.8,
      students: 3200,
      courses: 15,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      description:
        "Full-stack developer and React expert with extensive industry experience.",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      expertise: "UX/UI Design",
      rating: 4.9,
      students: 1800,
      courses: 8,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      description:
        "Creative designer passionate about creating beautiful and functional user experiences.",
    },
    {
      id: 4,
      name: "David Kim",
      expertise: "Mobile App Development",
      rating: 4.7,
      students: 2100,
      courses: 10,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      description:
        "iOS and Android developer with expertise in cross-platform development.",
    },
  ];

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
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="container-custom py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Meet Our Expert Mentors
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn from industry professionals and experts who are passionate
              about sharing their knowledge and helping you succeed.
            </p>
          </div>

          {/* Mentors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="card group hover:shadow-large transition-all duration-300"
              >
                {/* Mentor Image */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100">
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Mentor Info */}
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-1">
                      {mentor.name}
                    </h3>
                    <p className="text-primary-600 font-medium">
                      {mentor.expertise}
                    </p>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {mentor.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FiStar className="w-4 h-4" />
                      <span>{mentor.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiUsers className="w-4 h-4" />
                      <span>{mentor.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiBookOpen className="w-4 h-4" />
                      <span>{mentor.courses}</span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center justify-center space-x-1">
                    {renderStars(mentor.rating)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button className="flex-1 btn-primary text-sm py-2">
                      View Courses
                    </button>
                    <button className="flex-1 btn-outline text-sm py-2">
                      <FiMail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-xl p-8 shadow-soft max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Want to Become a Mentor?
              </h2>
              <p className="text-gray-600 mb-6">
                Share your expertise and help others learn. Join our community
                of expert instructors.
              </p>
              <button className="btn-primary">Apply as Mentor</button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MentorsPage;

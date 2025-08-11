import ProtectedRoute from "@/components/ProtectedRoute";
import { FiCalendar, FiUser, FiClock, FiArrowRight } from "react-icons/fi";

const BlogPage = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Online Learning: Trends to Watch in 2024",
      excerpt:
        "Discover the latest trends shaping the future of online education and how they're transforming the way we learn.",
      author: "Dr. Sarah Johnson",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "Education",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
      featured: true,
    },
    {
      id: 2,
      title: "Mastering React Hooks: A Comprehensive Guide",
      excerpt:
        "Learn how to effectively use React Hooks to build modern, functional components with cleaner code.",
      author: "Prof. Michael Chen",
      date: "2024-01-12",
      readTime: "8 min read",
      category: "Programming",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      id: 3,
      title: "Building Effective Learning Habits: A Student's Guide",
      excerpt:
        "Develop powerful study habits that will help you retain information better and achieve your learning goals.",
      author: "Emma Rodriguez",
      date: "2024-01-10",
      readTime: "6 min read",
      category: "Learning",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      id: 4,
      title: "The Art of UI/UX Design: Principles Every Designer Should Know",
      excerpt:
        "Explore the fundamental principles of UI/UX design that create engaging and intuitive user experiences.",
      author: "David Kim",
      date: "2024-01-08",
      readTime: "7 min read",
      category: "Design",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      id: 5,
      title: "Data Science Career Path: From Beginner to Expert",
      excerpt:
        "Navigate your data science career journey with this comprehensive roadmap and practical advice.",
      author: "Dr. Sarah Johnson",
      date: "2024-01-05",
      readTime: "10 min read",
      category: "Career",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      id: 6,
      title: "Mobile App Development: Choosing the Right Framework",
      excerpt:
        "Compare popular mobile development frameworks and learn which one is best for your next project.",
      author: "David Kim",
      date: "2024-01-03",
      readTime: "9 min read",
      category: "Development",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
      featured: false,
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="container-custom py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Learning Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Insights, tips, and stories from our community of learners and
              educators.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Featured Article
              </h2>
              <div className="card group hover:shadow-large transition-all duration-300">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {featuredPost.category}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors duration-200">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FiUser className="w-4 h-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>{formatDate(featuredPost.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-4 h-4" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                    <button className="btn-primary flex items-center space-x-2">
                      <span>Read More</span>
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular Posts Grid */}
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">
              Latest Articles
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <div
                  key={post.id}
                  className="card group hover:shadow-large transition-all duration-300"
                >
                  {/* Post Image */}
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Post Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FiUser className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      <FiCalendar className="w-4 h-4 inline mr-1" />
                      {formatDate(post.date)}
                    </div>

                    {/* Read More Button */}
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-200">
                      <span>Read More</span>
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-xl p-8 shadow-soft max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Stay Updated
              </h2>
              <p className="text-gray-600 mb-6">
                Get the latest articles and learning tips delivered to your
                inbox.
              </p>
              <div className="flex max-w-md mx-auto space-x-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button className="btn-primary">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default BlogPage;

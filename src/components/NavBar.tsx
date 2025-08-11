"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiMenu,
  FiX,
  FiUser,
  FiBookOpen,
  FiHome,
  FiUsers,
  FiFileText,
  FiMail,
} from "react-icons/fi";
import { isAuthenticated, getUser, authAPI } from "@/lib/api";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const currentUser = getUser();
      setIsLoggedIn(authenticated);
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setIsLoggedIn(false);
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigationItems = [
    { name: "Home", href: "/", icon: FiHome },
    { name: "Courses", href: "/courses", icon: FiBookOpen },
    { name: "Mentors", href: "/mentors", icon: FiUsers },
    { name: "Blog", href: "/blog", icon: FiFileText },
    { name: "Contact", href: "/contact", icon: FiMail },
  ];

  if (isLoading) {
    return (
      <nav className="bg-secondary-900 shadow-large">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8  rounded-lg animate-pulse"></div>
              <div className="ml-3 w-24 h-6 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="hidden md:flex space-x-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-16 h-4 bg-gray-300 rounded animate-pulse"
                ></div>
              ))}
            </div>
            <div className="w-24 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-secondary-900 shadow-large sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-200">
              <FiBookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-primary-500 group-hover:text-primary-400 transition-colors duration-200">
              LEARN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-900 hover:text-gray-400 transition-colors duration-200 group"
                >
                  <Icon className="w-4 h-4 group-hover:text-primary-400 transition-colors duration-200" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <FiUser className="w-4 h-4" />
                  <span className="font-medium">
                    {user?.first_name || user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm px-4 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="btn-primary text-sm px-6 py-2"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-secondary-800 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-secondary-800 rounded-lg mt-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-secondary-700 rounded-md transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="border-t border-secondary-700 pt-2 mt-2">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3 py-2 text-gray-300">
                      <FiUser className="w-4 h-4" />
                      <span>{user?.first_name || user?.username}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-secondary-700 rounded-md transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-primary-400 hover:text-primary-300 hover:bg-secondary-700 rounded-md transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

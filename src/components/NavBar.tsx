"use client";

import { useState } from "react";
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
  FiLogOut,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);

      // Call API logout to invalidate tokens on backend
      await authAPI.logout();

      // Clear local auth state
      logout();

      // Close modal and redirect
      setShowLogoutModal(false);
      router.push("/");

      console.log("Logout completed successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API logout fails, clear local state for security
      logout();
      setShowLogoutModal(false);
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowLogoutModal(false);
      setIsModalClosing(false);
    }, 300);
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { name: "Home", href: "/", icon: FiHome },
      { name: "Courses", href: "/courses", icon: FiBookOpen },
    ];

    if (user?.role === "instructor") {
      return [
        ...baseItems,
        { name: "Dashboard", href: "/instructor", icon: FiUser },
        {
          name: "Create Course",
          href: "/instructor/courses/create",
          icon: FiPlus,
        },
      ];
    } else if (user?.role === "student") {
      return [
        ...baseItems,
        { name: "Dashboard", href: "/student", icon: FiUser },
        { name: "My Courses", href: "/student", icon: FiBookOpen },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

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
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-200 group"
                  >
                    <Icon className="w-4 h-4 group-hover:text-primary-400 transition-colors duration-200" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <FiUser className="w-4 h-4" />
                  <span className="font-medium">
                    {user?.first_name || user?.username}
                  </span>
                  <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="btn-outline text-sm px-4 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-sm px-6 py-2"
                >
                  Get Started
                </Link>
              </div>
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
              {isAuthenticated &&
                navigationItems.map((item) => {
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
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3 py-2 text-gray-300">
                      <FiUser className="w-4 h-4" />
                      <span>{user?.first_name || user?.username}</span>
                      <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
                        {user?.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogoutClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-secondary-700 rounded-md transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/login"
                      className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-secondary-700 rounded-md transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-3 py-2 text-primary-400 hover:text-primary-300 hover:bg-secondary-700 rounded-md transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-gray-300 opacity-50 transition-opacity duration-300 ease-in-out ${
              isModalClosing ? "bg-opacity-0" : "bg-opacity-50"
            }`}
            onClick={handleLogoutCancel}
          />

          {/* Modal */}
          <div
            className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out ${
              isModalClosing ? "fade-out" : "animate-in fade-in-0 zoom-in-95"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={handleLogoutCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <FiLogOut className="h-8 w-8 text-red-600" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Confirm Logout
              </h3>

              {/* Message */}
              <p className="text-gray-600 mb-8">
                Are you sure you want to logout? You will need to sign in again
                to access your account.
              </p>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleLogoutCancel}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;

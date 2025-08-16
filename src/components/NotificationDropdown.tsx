"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiBell,
  FiX,
  FiClock,
  FiUser,
  FiMessageSquare,
  FiInfo,
} from "react-icons/fi";
import { Notification } from "@/types";
import { sessionAPI } from "@/lib/sessionAPI";
import { useAuth } from "@/contexts/AuthContext";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await sessionAPI.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await sessionAPI.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await sessionAPI.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return <FiClock className="w-4 h-4" />;
      case "booking_request":
        return <FiUser className="w-4 h-4" />;
      case "session_update":
        return <FiMessageSquare className="w-4 h-4" />;
      default:
        return <FiInfo className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <FiBell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex-shrink-0 p-2 rounded-full ${
                          notification.read ? "bg-gray-100" : "bg-blue-100"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            notification.read
                              ? "text-gray-900"
                              : "text-blue-900"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={handleMarkAllAsRead}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

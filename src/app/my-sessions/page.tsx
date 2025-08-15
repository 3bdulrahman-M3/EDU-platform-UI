"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiRefreshCw,
  FiCalendar,
  FiUsers,
  FiBookOpen,
} from "react-icons/fi";
import { Session } from "@/types";
import { sessionAPI } from "@/lib/sessionAPI";
import SessionCard from "@/components/SessionCard";

const MySessionsPage = () => {
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [createdSessions, setCreatedSessions] = useState<Session[]>([]);
  const [joinedSessions, setJoinedSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMySessions();
  }, []);

  const fetchMySessions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all sessions where user is creator or participant
      const [allData, createdData, joinedData] = await Promise.all([
        sessionAPI.getMySessions(),
        sessionAPI.getCreatedSessions(),
        sessionAPI.getJoinedSessions(),
      ]);

      setAllSessions(allData);
      setCreatedSessions(createdData);
      setJoinedSessions(joinedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your sessions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionAction = () => {
    // Refresh sessions after an action
    fetchMySessions();
  };

  // Calculate statistics
  const totalSessions = allSessions.length;
  const upcomingSessions = allSessions.filter(
    (s) => s.status === "upcoming"
  ).length;
  const ongoingSessions = allSessions.filter(
    (s) => s.status === "ongoing"
  ).length;
  const completedSessions = allSessions.filter(
    (s) => s.status === "completed"
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-300 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
                Error Loading Sessions
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button onClick={fetchMySessions} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📚 My Sessions
            </h1>
            <p className="text-gray-600">
              Manage your created and joined tutoring sessions
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={fetchMySessions}
              className="btn-outline flex items-center space-x-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <Link
              href="/sessions/create"
              className="btn-primary flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Session</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <FiCalendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSessions}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <FiUsers className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Created Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {createdSessions.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <FiBookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Joined Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {joinedSessions.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <FiCalendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingSessions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Ongoing</p>
              <p className="text-xl font-bold text-yellow-600">
                {ongoingSessions}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-green-600">
                {completedSessions}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-red-600">
                {allSessions.filter((s) => s.status === "cancelled").length}
              </p>
            </div>
          </div>
        </div>

        {/* Created Sessions */}
        {createdSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sessions I Created ({createdSessions.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  showActions={false}
                  onAction={handleSessionAction}
                />
              ))}
            </div>
          </div>
        )}

        {/* Joined Sessions */}
        {joinedSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sessions I Joined ({joinedSessions.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onAction={handleSessionAction}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allSessions.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sessions yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't created or joined any tutoring sessions yet.
            </p>
            <div className="space-x-4">
              <Link
                href="/sessions/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Your First Session
              </Link>
              <Link
                href="/sessions"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Available Sessions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySessionsPage;

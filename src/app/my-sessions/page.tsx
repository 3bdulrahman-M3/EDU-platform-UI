"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiCalendar, FiUsers, FiClock } from "react-icons/fi";
import Link from "next/link";
import SessionCard from "@/components/SessionCard";
import { Session } from "@/types";
import { sessionAPI } from "@/lib/sessionAPI";
import { useAuth } from "@/contexts/AuthContext";

const MySessionsPage = () => {
  const { user } = useAuth();
  const [createdSessions, setCreatedSessions] = useState<Session[]>([]);
  const [joinedSessions, setJoinedSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");

  useEffect(() => {
    if (user) {
      fetchMySessions();
    }
  }, [user]);

  const fetchMySessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await sessionAPI.getMySessions();

      // Add null checks and default values
      setCreatedSessions(response?.created || []);
      setJoinedSessions(response?.joined || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load your sessions"
      );
      // Set empty arrays as fallback
      setCreatedSessions([]);
      setJoinedSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = () => {
    // Refresh sessions after an action
    fetchMySessions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your sessions...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
            <p className="mt-2 text-gray-600">
              Manage your created sessions and view joined sessions
            </p>
          </div>
          <Link
            href="/sessions/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Create New Session
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCalendar className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Created Sessions
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {createdSessions?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUsers className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Joined Sessions
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {joinedSessions?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiClock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Sessions
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(createdSessions?.length || 0) +
                    (joinedSessions?.length || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("created")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "created"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                As Tutor ({createdSessions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("joined")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "joined"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                As Student ({joinedSessions?.length || 0})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "created" ? (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Sessions You Created
                </h2>
                {!createdSessions || createdSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No created sessions
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't created any sessions yet. Start by creating
                      your first session.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/sessions/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Create Session
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {createdSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onAction={handleSessionAction}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Sessions You Joined
                </h2>
                {!joinedSessions || joinedSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No joined sessions
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't joined any sessions yet. Browse available
                      sessions to join.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/sessions"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        Browse Sessions
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {joinedSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onAction={handleSessionAction}
                        showActions={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySessionsPage;

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiSearch, FiPlus, FiRefreshCw, FiFilter, FiX } from "react-icons/fi";
import { Session } from "@/types";
import { sessionAPI } from "@/lib/sessionAPI";
import SessionCard from "@/components/SessionCard";

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    date_from: "",
    date_to: "",
    creator: "",
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    // Apply search filter to sessions
    const filtered = sessions.filter(
      (session) =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.creator?.first_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        session.creator?.last_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredSessions(filtered);
  }, [sessions, searchTerm]);

  const fetchSessions = async (apiFilters?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await sessionAPI.getSessions(apiFilters);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionAction = () => {
    // Refresh sessions after an action
    fetchSessions();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const apiFilters: any = {};

    if (filters.status) apiFilters.status = filters.status;
    if (filters.date_from) apiFilters.date_from = filters.date_from;
    if (filters.date_to) apiFilters.date_to = filters.date_to;
    if (filters.creator) apiFilters.creator = parseInt(filters.creator);

    fetchSessions(apiFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      date_from: "",
      date_to: "",
      creator: "",
    });
    fetchSessions();
    setShowFilters(false);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

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
              <button onClick={() => fetchSessions()} className="btn-primary">
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
              🎓 Tutoring Sessions
            </h1>
            <p className="text-gray-600">
              Join interactive tutoring sessions with instructors and peers
            </p>
          </div>
          <Link
            href="/sessions/create"
            className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Session</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                  hasActiveFilters
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FiFilter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                    Active
                  </span>
                )}
              </button>
              <button
                onClick={() => fetchSessions()}
                className="btn-outline flex items-center space-x-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="datetime-local"
                      value={filters.date_from}
                      onChange={(e) =>
                        handleFilterChange("date_from", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="datetime-local"
                      value={filters.date_to}
                      onChange={(e) =>
                        handleFilterChange("date_to", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Creator ID
                    </label>
                    <input
                      type="number"
                      placeholder="Enter creator ID"
                      value={filters.creator}
                      onChange={(e) =>
                        handleFilterChange("creator", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-3 mt-4">
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                  <button onClick={applyFilters} className="btn-primary">
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
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
              {searchTerm || hasActiveFilters
                ? "No sessions found"
                : "No sessions available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || hasActiveFilters
                ? "Try adjusting your search terms or filters"
                : "Be the first to create a tutoring session!"}
            </p>
            {!searchTerm && !hasActiveFilters && (
              <Link
                href="/sessions/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create First Session
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onAction={handleSessionAction}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredSessions.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredSessions.length} of {sessions.length} sessions
              {hasActiveFilters && " (filtered)"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;

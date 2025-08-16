"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiPlus } from "react-icons/fi";
import Link from "next/link";
import SessionCard from "@/components/SessionCard";
import { Session } from "@/types";
import { sessionAPI } from "@/lib/sessionAPI";

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mysessions, setMysessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  useEffect(() => {
    fetchSessions();
  }, [searchTerm, statusFilter, levelFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (searchTerm) filters.subject = searchTerm;
      if (statusFilter) filters.status = statusFilter;
      if (levelFilter) filters.level = levelFilter;

      const response = await sessionAPI.getSessions(filters);
      const mysessionsresponse = await sessionAPI.getMySessions(filters);
      setMysessions(mysessionsresponse.result)
      setSessions(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setLevelFilter("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sessions...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">
              Browse Sessions
            </h1>
            <p className="mt-2 text-gray-600">
              Find and join peer-to-peer learning sessions
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

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Sessions Grid */}
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No sessions found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or create a new session.
            </p>
            <div className="mt-6">
              <Link
                href="/sessions/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Create New Session
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.count > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {sessions.length} of {pagination.count} sessions
            </div>
            <div className="flex space-x-2">
              {pagination.previous && (
                <button
                  onClick={() => {
                    // Handle previous page
                    fetchSessions();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {pagination.next && (
                <button
                  onClick={() => {
                    // Handle next page
                    fetchSessions();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;

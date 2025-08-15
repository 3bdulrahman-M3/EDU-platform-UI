"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiUsers,
  FiAlertTriangle,
  FiPlay,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { Session } from "@/types";
import { sessionAPI } from "@/lib/sessionAPI";
import StatusBadge from "@/components/StatusBadge";
import ParticipantList from "@/components/ParticipantList";

const SessionDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = parseInt(params.id as string);

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await sessionAPI.getSessionDetails(sessionId);
      setSession(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load session details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (
    action: "join" | "leave" | "cancel" | "start" | "complete"
  ) => {
    if (!session || actionLoading) return;

    setActionLoading(action);
    setError(null);
    setSuccessMessage(null);

    try {
      let updatedSession: Session;
      let successMsg: string;

      switch (action) {
        case "join":
          updatedSession = await sessionAPI.joinSession(session.id);
          successMsg = "Successfully joined the session!";
          break;
        case "leave":
          updatedSession = await sessionAPI.leaveSession(session.id);
          successMsg = "Successfully left the session!";
          break;
        case "cancel":
          updatedSession = await sessionAPI.cancelSession(session.id);
          successMsg = "Session cancelled successfully!";
          break;
        case "start":
          updatedSession = await sessionAPI.startSession(session.id);
          successMsg = "Session started successfully!";
          break;
        case "complete":
          updatedSession = await sessionAPI.completeSession(session.id);
          successMsg = "Session completed successfully!";
          break;
        default:
          throw new Error("Invalid action");
      }

      setSession(updatedSession);
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${action} session`
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiAlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error ? "Error Loading Session" : "Session Not Found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {error || "The session you're looking for doesn't exist."}
              </p>
              <div className="space-y-2">
                <button onClick={fetchSessionDetails} className="btn-primary">
                  Try Again
                </button>
                <Link href="/sessions" className="btn-outline block">
                  Back to Sessions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use API response properties if available, otherwise fallback to calculated values
  const isJoined = session.participants?.some((p) => p.user.id === 1) || false; // TODO: Get current user ID from auth context
  const isCreator = session.creator?.id === 1; // TODO: Get current user ID from auth context
  const isFull =
    session.is_full ||
    (session.participants &&
      session.participants.length >= session.max_participants);
  const canJoin =
    session.can_join !== undefined
      ? session.can_join
      : !isJoined && !isFull && session.status === "upcoming";
  const canLeave = isJoined && session.status === "upcoming";
  const canCancel = isCreator && session.status === "upcoming";
  const canStart = isCreator && session.status === "upcoming";
  const canComplete = isCreator && session.status === "ongoing";
  const participantCount =
    session.participant_count ||
    (session.participants ? session.participants.length : 0);
  const availableSpots =
    session.available_spots || session.max_participants - participantCount;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/sessions"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Sessions
        </Link>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Session Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {session.title}
                  </h1>
                  <StatusBadge status={session.status} />
                </div>
                <p className="text-gray-600">{session.description}</p>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="w-5 h-5 mr-3" />
                  <span>{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiClock className="w-5 h-5 mr-3" />
                  <span>{formatTime(session.date)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiUser className="w-5 h-5 mr-3" />
                  <span>
                    Created by {session.creator?.first_name}{" "}
                    {session.creator?.last_name}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiUsers className="w-5 h-5 mr-3" />
                  <span>
                    {participantCount}/{session.max_participants} participants
                    {availableSpots > 0 && (
                      <span className="text-green-600 ml-1">
                        ({availableSpots} spots available)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {/* Join/Leave Actions */}
                {canJoin && (
                  <button
                    onClick={() => handleAction("join")}
                    disabled={actionLoading === "join"}
                    className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === "join" ? "Joining..." : "Join Session"}
                  </button>
                )}
                {canLeave && (
                  <button
                    onClick={() => handleAction("leave")}
                    disabled={actionLoading === "leave"}
                    className="w-full px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === "leave" ? "Leaving..." : "Leave Session"}
                  </button>
                )}

                {/* Creator Actions */}
                {canStart && (
                  <button
                    onClick={() => handleAction("start")}
                    disabled={actionLoading === "start"}
                    className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <FiPlay className="w-4 h-4 mr-2" />
                    {actionLoading === "start"
                      ? "Starting..."
                      : "Start Session"}
                  </button>
                )}
                {canComplete && (
                  <button
                    onClick={() => handleAction("complete")}
                    disabled={actionLoading === "complete"}
                    className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <FiCheck className="w-4 h-4 mr-2" />
                    {actionLoading === "complete"
                      ? "Completing..."
                      : "Complete Session"}
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => handleAction("cancel")}
                    disabled={actionLoading === "cancel"}
                    className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <FiX className="w-4 h-4 mr-2" />
                    {actionLoading === "cancel"
                      ? "Cancelling..."
                      : "Cancel Session"}
                  </button>
                )}

                {/* Status Indicators */}
                {isJoined && !canLeave && (
                  <span className="inline-flex items-center px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-md">
                    ✓ Joined
                  </span>
                )}
                {isFull && !isJoined && (
                  <span className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-md">
                    Session Full
                  </span>
                )}
                {session.status === "ongoing" && (
                  <span className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-md">
                    🎯 Session in Progress
                  </span>
                )}
                {session.status === "completed" && (
                  <span className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-md">
                    ✅ Session Completed
                  </span>
                )}
                {session.status === "cancelled" && (
                  <span className="inline-flex items-center px-3 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-md">
                    ❌ Session Cancelled
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="p-6">
            <ParticipantList
              participants={session.participants}
              maxParticipants={session.max_participants}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsPage;

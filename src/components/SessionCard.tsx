"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiUser,
  FiArrowRight,
} from "react-icons/fi";
import { Session } from "@/types";
import StatusBadge from "./StatusBadge";
import { sessionAPI } from "@/lib/sessionAPI";
import { useAuth } from "@/contexts/AuthContext";
import {
  utcToLocal,
  formatDateForDisplay,
  formatTimeForDisplay,
  getCurrentTimezone,
} from "@/lib/timezoneUtils";

interface SessionCardProps {
  session: Session;
  showActions?: boolean;
  onAction?: () => void;
}

const SessionCard = ({
  session,
  showActions = true,
  onAction,
}: SessionCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    const localDate = utcToLocal(dateString);
    return formatDateForDisplay(localDate);
  };

  const formatTime = (dateString: string) => {
    const localDate = utcToLocal(dateString);
    return formatTimeForDisplay(localDate);
  };

  const handleJoinSession = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("=== SESSION CARD DEBUG ===");
      console.log("Session ID:", session.id);
      console.log("Session status:", session.status);
      console.log("Session creator:", session.creator);
      console.log("Current user:", user);
      console.log("Is creator:", isCreator);
      console.log("Is joined:", isJoined);
      console.log("Has pending request:", hasPendingRequest);
      console.log("Has approved request:", hasApprovedRequest);
      console.log("Has rejected request:", hasRejectedRequest);
      console.log("Can join:", canJoin);
      console.log("Is full:", isFull);
      console.log("Booking requests:", session.booking_requests);

      await sessionAPI.joinSession(session.id);
      console.log("✅ Successfully joined session");
      onAction?.();
    } catch (err) {
      console.error("❌ Error joining session:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const response = (
          err as { response?: { status?: number; data?: unknown } }
        ).response;
        console.log("Response status:", response?.status);
        console.log("Response data:", response?.data);

        if (response?.status === 400) {
          const responseData = response.data as
            | { message?: string; detail?: string; error?: string }
            | string
            | undefined;

          let errorMessage = "Invalid request data";

          if (typeof responseData === "string") {
            errorMessage = responseData;
          } else if (responseData?.message) {
            errorMessage = responseData.message;
          } else if (responseData?.detail) {
            errorMessage = responseData.detail;
          } else if (responseData?.error) {
            errorMessage = responseData.error;
          }

          // Handle specific backend error messages
          if (errorMessage.includes("Session is full")) {
            setError(
              "This session is full and cannot accept more participants"
            );
          } else if (errorMessage.includes("Already joined")) {
            setError("You are already a participant in this session");
          } else if (errorMessage.includes("Booking request already pending")) {
            setError("You already have a pending request to join this session");
          } else if (
            errorMessage.includes("Booking request already approved")
          ) {
            setError("Your request to join this session was already approved");
          } else if (errorMessage.includes("Booking request was rejected")) {
            setError("Your request to join this session was rejected");
          } else {
            setError(errorMessage);
          }
        } else if (response?.status === 401) {
          setError("You must be logged in to join sessions");
        } else if (response?.status === 403) {
          setError("You do not have permission to join this session");
        } else if (response?.status === 404) {
          setError("Session not found");
        } else {
          const responseData = response?.data as
            | { message?: string }
            | undefined;
          setError(
            `Server error: ${responseData?.message || "Unknown error occurred"}`
          );
        }
      } else {
        setError("Failed to join session");
      }
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Use API response properties if available, otherwise fallback to calculated values
  const isJoined =
    session.participants?.some((p) => p.user.id === user?.id) || false;
  const isCreator = session.creator?.id === user?.id;
  const hasPendingRequest =
    session.booking_requests?.some(
      (r) => r.user.id === user?.id && r.status === "pending"
    ) || false;
  const hasApprovedRequest =
    session.booking_requests?.some(
      (r) => r.user.id === user?.id && r.status === "approved"
    ) || false;
  const hasRejectedRequest =
    session.booking_requests?.some(
      (r) => r.user.id === user?.id && r.status === "rejected"
    ) || false;
  const isFull =
    session.is_full ||
    (session.participants &&
      session.participants.length >= session.max_participants);
  const canJoin =
    session.can_join !== undefined
      ? session.can_join
      : !isJoined && !isFull && session.status === "scheduled";
  const participantCount =
    session.participant_count ||
    (session.participants ? session.participants.length : 0);
  const availableSpots =
    session.available_spots || session.max_participants - participantCount;

  return (
    <div className="bg-secondary-900 rounded-lg shadow-sm border border-gray-800 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              {session.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {session.description}
            </p>
          </div>
          <StatusBadge status={session.status} />
        </div>

        {/* Session Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <FiCalendar className="w-4 h-4 mr-2" />
            <span>{formatDate(session.date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <FiClock className="w-4 h-4 mr-2" />
            <span>{formatTime(session.date)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-400">
            <FiUser className="w-4 h-4 mr-2" />
            <span>
              by {session.creator?.first_name} {session.creator?.last_name}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <FiUsers className="w-4 h-4 mr-2" />
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-error-900 border border-error-700 rounded-md">
            <p className="text-sm text-error-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              {isCreator ? (
                <Link
                  href={`/sessions/${session.id}`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Manage Session
                </Link>
              ) : isJoined ? (
                <span className="px-3 py-1 bg-success-900 text-success-400 text-sm font-medium rounded-full">
                  Joined
                </span>
              ) : hasPendingRequest ? (
                <span className="px-3 py-1 bg-warning-900 text-warning-400 text-sm font-medium rounded-full">
                  Request Pending
                </span>
              ) : hasApprovedRequest ? (
                <span className="px-3 py-1 bg-accent-900 text-accent-400 text-sm font-medium rounded-full">
                  Request Approved
                </span>
              ) : hasRejectedRequest ? (
                <span className="px-3 py-1 bg-error-900 text-error-400 text-sm font-medium rounded-full">
                  Request Rejected
                </span>
              ) : canJoin ? (
                <button
                  onClick={handleJoinSession}
                  disabled={isLoading}
                  className="px-4 py-2 bg-accent-700 text-white text-sm font-medium rounded-md hover:bg-accent-800 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Requesting..." : "Request to Join"}
                </button>
              ) : (
                <span className="px-3 py-1 bg-gray-800 text-gray-400 text-sm font-medium rounded-full">
                  {isFull ? "Session Full" : "Cannot Join"}
                </span>
              )}
            </div>
            <Link
              href={`/sessions/${session.id}`}
              className="flex items-center text-accent-500 hover:text-accent-400 text-sm font-medium"
            >
              View Details
              <FiArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionCard;

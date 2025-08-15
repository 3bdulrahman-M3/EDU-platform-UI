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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleJoinSession = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await sessionAPI.joinSession(session.id);
      onAction?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

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
  const participantCount =
    session.participant_count ||
    (session.participants ? session.participants.length : 0);
  const availableSpots =
    session.available_spots || session.max_participants - participantCount;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {session.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {session.description}
            </p>
          </div>
          <StatusBadge status={session.status} />
        </div>

        {/* Session Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar className="w-4 h-4 mr-2" />
            <span>{formatDate(session.date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiClock className="w-4 h-4 mr-2" />
            <span>{formatTime(session.date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiUser className="w-4 h-4 mr-2" />
            <span>
              by {session.creator?.first_name} {session.creator?.last_name}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
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
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              {canJoin && (
                <button
                  onClick={handleJoinSession}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Joining..." : "Join Session"}
                </button>
              )}
              {isJoined && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Joined
                </span>
              )}
              {isFull && !isJoined && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                  Full
                </span>
              )}
              {session.status === "ongoing" && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  In Progress
                </span>
              )}
              {session.status === "completed" && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                  Completed
                </span>
              )}
              {session.status === "cancelled" && (
                <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                  Cancelled
                </span>
              )}
            </div>
            <Link
              href={`/sessions/${session.id}`}
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
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

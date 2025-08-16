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
  FiDownload,
  FiLink,
  FiFile,
  FiUpload,
  FiMessageSquare,
  FiEdit,
} from "react-icons/fi";
import { Session, BookingRequest, SessionMaterial } from "@/types";
import { sessionAPI } from "@/lib/sessionAPI";
import StatusBadge from "@/components/StatusBadge";
import ParticipantList from "@/components/ParticipantList";
import { useAuth } from "@/contexts/AuthContext";
import {
  utcToLocal,
  formatDateForDisplay,
  formatTimeForDisplay,
} from "@/lib/timezoneUtils";

const SessionDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = parseInt(params.id as string);

  const [session, setSession] = useState<Session | null>(null);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sessionData = await sessionAPI.getSessionDetails(sessionId);
      setSession(sessionData);
      setBookingRequests(sessionData.booking_requests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load session details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!session) return;

    setActionLoading(action);
    try {
      switch (action) {
        case "start":
          // Handle start session
          break;
        case "complete":
          // Handle complete session
          break;
        case "cancel":
          await sessionAPI.cancelSession(session.id);
          setSuccessMessage("Session cancelled successfully");
          break;
      }
      await fetchSessionDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to perform action");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const localDate = utcToLocal(dateString);
    return formatDateForDisplay(localDate);
  };

  const formatTime = (dateString: string) => {
    const localDate = utcToLocal(dateString);
    return formatTimeForDisplay(localDate);
  };

  // P2P specific handlers
  const handleRequestJoin = async () => {
    if (!session) return;

    setActionLoading("request");
    try {
      await sessionAPI.joinSession(session.id, requestMessage);
      setSuccessMessage("Request to join sent successfully");
      setShowRequestModal(false);
      setRequestMessage("");
      await fetchSessionDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveRequest = async (userId: number) => {
    if (!session) return;

    setActionLoading(`approve-${userId}`);
    try {
      await sessionAPI.approveRequest(session.id, userId);
      setSuccessMessage("Request approved successfully");
      await fetchSessionDetails();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve request"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (userId: number) => {
    if (!session) return;

    setActionLoading(`reject-${userId}`);
    try {
      await sessionAPI.rejectRequest(session.id, userId);
      setSuccessMessage("Request rejected successfully");
      await fetchSessionDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!session) return;

    setActionLoading("cancel-booking");
    try {
      // This would be a new API endpoint for canceling a booking
      setSuccessMessage("Booking cancelled successfully");
      await fetchSessionDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading session details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <FiAlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error ? "Error Loading Session" : "Session Not Found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {error || "The session you're looking for doesn't exist."}
              </p>
              <Link
                href="/sessions"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use API response properties if available, otherwise fallback to calculated values
  const isJoined =
    session.participants?.some((p) => p.user.id === user?.id) || false;
  const isCreator = session.creator?.id === user?.id;
  const isFull =
    session.is_full ||
    (session.participants &&
      session.participants.length >= session.max_participants);
  const canJoin =
    session.can_join !== undefined
      ? session.can_join
      : !isJoined && !isFull && session.status === "scheduled";
  const canStart = isCreator && session.status === "scheduled";
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
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Sessions
        </Link>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Session Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {session.title}
                </h1>
                <p className="text-gray-600 mb-4">{session.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiUser className="w-4 h-4 mr-1" />
                    <span>
                      by {session.creator?.first_name}{" "}
                      {session.creator?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="w-4 h-4 mr-1" />
                    <span>
                      {participantCount}/{session.max_participants} participants
                    </span>
                  </div>
                </div>
              </div>
              <StatusBadge status={session.status} size="lg" />
            </div>
          </div>

          {/* Session Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <FiCalendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(session.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FiClock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Time</p>
                  <p className="text-sm text-gray-600">
                    {formatTime(session.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FiClock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Duration</p>
                  <p className="text-sm text-gray-600">
                    {session.duration} minutes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 space-y-3">
            {/* P2P Join/Request Actions */}
            {!isCreator && !isJoined && canJoin && (
              <button
                onClick={() => setShowRequestModal(true)}
                disabled={actionLoading === "request"}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === "request"
                  ? "Requesting..."
                  : "Request to Join"}
              </button>
            )}
            {!isCreator && isJoined && (
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading === "cancel-booking"}
                className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === "cancel-booking"
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>
            )}

            {/* Creator Actions */}
            {isCreator && session.status === "scheduled" && (
              <Link
                href={`/sessions/${session.id}/edit`}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              >
                <FiEdit className="w-4 h-4 mr-2" />
                Edit Session
              </Link>
            )}
            {canStart && (
              <Link
                href={`/sessions/${session.id}/live`}
                className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
              >
                <FiPlay className="w-4 h-4 mr-2" />
                Enter Live Session
              </Link>
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
            {isCreator && session.status === "scheduled" && (
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
            {isJoined && !isCreator && (
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <FiCheck className="w-4 h-4 mr-1" />
                  Joined
                </span>
              </div>
            )}
            {isFull && !isJoined && (
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Session Full
                </span>
              </div>
            )}
            {session.status === "ongoing" && (
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  In Progress
                </span>
              </div>
            )}
            {session.status === "completed" && (
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Completed
                </span>
              </div>
            )}
            {session.status === "cancelled" && (
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Cancelled
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Participants
            </h3>
            <ParticipantList
              participants={session.participants}
              maxDisplay={session.max_participants}
            />
          </div>
        </div>

        {/* P2P Specific Sections */}
        {/* Booking Requests (for tutors) */}
        {isCreator && bookingRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Booking Requests
              </h3>
              <div className="space-y-4">
                {bookingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.user.first_name} {request.user.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested: {formatDate(request.requested_at)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveRequest(request.user.id)}
                          disabled={
                            actionLoading === `approve-${request.user.id}`
                          }
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === `approve-${request.user.id}`
                            ? "Approving..."
                            : "Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.user.id)}
                          disabled={
                            actionLoading === `reject-${request.user.id}`
                          }
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === `reject-${request.user.id}`
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Materials Section */}
        {session.materials && session.materials.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Session Materials
              </h3>
              <div className="space-y-3">
                {session.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      {material.type === "file" && (
                        <FiFile className="w-5 h-5 text-gray-400 mr-3" />
                      )}
                      {material.type === "link" && (
                        <FiLink className="w-5 h-5 text-gray-400 mr-3" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {material.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Uploaded by {material.uploaded_by.first_name}{" "}
                          {material.uploaded_by.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {material.type === "file" && (
                        <a
                          href={material.file}
                          download
                          className="p-2 text-gray-600 hover:text-gray-900"
                        >
                          <FiDownload className="w-4 h-4" />
                        </a>
                      )}
                      {material.type === "link" && (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-gray-900"
                        >
                          <FiLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Materials (for tutors) */}
        {isCreator && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Upload Materials
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop files here, or click to select files
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, PPT, images, and links
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Session Button (Future WebRTC) */}
        {isJoined && session.status === "scheduled" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="p-6">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center">
                <FiPlay className="w-5 h-5 mr-2" />
                Enter Live Session
              </button>
              <p className="text-sm text-gray-600 text-center mt-2">
                Video and audio functionality coming soon
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Request Join Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Request to Join Session
              </h3>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Add a message to your request (optional)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestJoin}
                  disabled={actionLoading === "request"}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading === "request" ? "Sending..." : "Send Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetailsPage;

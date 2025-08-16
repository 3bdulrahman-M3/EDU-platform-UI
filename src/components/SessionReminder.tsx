"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiClock,
  FiCalendar,
  FiUsers,
  FiVideo,
  FiX,
  FiBell,
  FiCheck,
} from "react-icons/fi";
import { Session } from "@/types";
import {
  utcToLocal,
  formatTimeForDisplay,
  formatDateForDisplay,
} from "@/lib/timezoneUtils";

interface SessionReminderProps {
  session: Session;
  onDismiss: () => void;
  onJoinEarly: () => void;
}

const SessionReminder = ({
  session,
  onDismiss,
  onJoinEarly,
}: SessionReminderProps) => {
  const [timeUntilSession, setTimeUntilSession] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const calculateTimeUntil = () => {
      const now = new Date();
      const sessionTime = utcToLocal(session.date);
      const diff = sessionTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilSession("Session starting now");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeUntilSession(`${hours}h ${minutes}m until session`);
      } else if (minutes > 0) {
        setTimeUntilSession(`${minutes}m until session`);
      } else {
        setTimeUntilSession("Session starting now");
      }
    };

    calculateTimeUntil();
    const interval = setInterval(calculateTimeUntil, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [session.date]);

  const formatTime = (dateString: string) => {
    const localDate = utcToLocal(dateString);
    return formatTimeForDisplay(localDate);
  };

  const formatDate = (dateString: string) => {
    const localDate = utcToLocal(dateString);
    return formatDateForDisplay(localDate);
  };

  const canJoinEarly = () => {
    const now = new Date();
    const sessionTime = utcToLocal(session.date);
    const diff = sessionTime.getTime() - now.getTime();
    return diff > 0 && diff <= 15 * 60 * 1000; // Can join 15 minutes early
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiBell className="w-5 h-5 text-white" />
            <h3 className="text-white font-medium">Session Reminder</h3>
          </div>
          <button
            onClick={onDismiss}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              {session.title}
            </h4>
            <p className="text-gray-600 text-sm mb-3">{session.description}</p>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(session.date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4" />
                <span>
                  {formatTime(session.date)} • {session.duration} minutes
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FiUsers className="w-4 h-4" />
                <span>
                  {session.participants?.length || 0}/{session.max_participants}{" "}
                  participants
                </span>
              </div>
            </div>
          </div>

          {/* Time Until Session */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {timeUntilSession}
              </span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {canJoinEarly() && (
              <button
                onClick={onJoinEarly}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FiVideo className="w-4 h-4 mr-2" />
                Join Early
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {isExpanded ? "Less" : "More"}
            </button>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">
                Session Details
              </h5>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Subject:</span>{" "}
                  {session.subject}
                </div>
                <div>
                  <span className="font-medium">Level:</span> {session.level}
                </div>
                <div>
                  <span className="font-medium">Host:</span>{" "}
                  {session.creator?.first_name} {session.creator?.last_name}
                </div>
              </div>

              <div className="mt-4">
                <h6 className="font-medium text-gray-900 mb-2">
                  Preparation Tips
                </h6>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start space-x-2">
                    <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Test your microphone and camera</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Find a quiet environment</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Have your questions ready</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionReminder;

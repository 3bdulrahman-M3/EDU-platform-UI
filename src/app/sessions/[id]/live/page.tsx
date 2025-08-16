"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiClock,
  FiUsers,
  FiVideo,
  FiMic,
  FiMicOff,
  FiVideoOff,
  FiSettings,
  FiShare,
  FiMonitor,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { Session } from "@/types";
import { sessionAPI } from "@/lib/sessionAPI";
import { useAuth } from "@/contexts/AuthContext";
import { utcToLocal, formatTimeForDisplay } from "@/lib/timezoneUtils";
import { webrtcService } from "@/lib/webrtcService";
import { toast } from "react-hot-toast";

interface Participant {
  id: number;
  name: string;
  role: string;
  audio: boolean;
  video: boolean;
  handRaised: boolean;
  stream?: MediaStream;
  screenStream?: MediaStream;
}

const LiveSessionPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = parseInt(params.id as string);

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<
    "waiting" | "live" | "ended"
  >("waiting");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isWebRTCInitialized, setIsWebRTCInitialized] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<{ [key: number]: HTMLVideoElement }>({});

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  // Initialize WebRTC when session goes live
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      sessionState === "live" &&
      !isWebRTCInitialized &&
      user
    ) {
      initializeWebRTC();
    }
  }, [sessionState, isWebRTCInitialized, user]);

  // Cleanup WebRTC on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && webrtcService.instance) {
        webrtcService.instance.cleanup();
      }
    };
  }, []);

  const initializeWebRTC = async () => {
    if (typeof window === "undefined") return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await webrtcService.getInstance().initialize(sessionId, user!.id, token);
      setIsWebRTCInitialized(true);

      // Set up WebRTC callbacks
      webrtcService.getInstance().setCallbacks({
        onUserJoined: (userId, userName) => {
          console.log(`User ${userName} joined the session`);
          setParticipants((prev) => {
            const existing = prev.find((p) => p.id === userId);
            if (!existing) {
              return [
                ...prev,
                {
                  id: userId,
                  name: userName,
                  role: "student",
                  audio: false,
                  video: false,
                  handRaised: false,
                },
              ];
            }
            return prev;
          });
        },
        onUserLeft: (userId) => {
          console.log(`User ${userId} left the session`);
          setParticipants((prev) => prev.filter((p) => p.id !== userId));
        },
        onStreamReceived: (userId, stream) => {
          console.log(`Received stream from user ${userId}`);
          setParticipants((prev) =>
            prev.map((p) => (p.id === userId ? { ...p, stream } : p))
          );

          // Set up video element for remote stream
          setTimeout(() => {
            const videoElement = remoteVideosRef.current[userId];
            if (videoElement && stream) {
              videoElement.srcObject = stream;
            }
          }, 100);
        },
        onScreenShareReceived: (userId, stream) => {
          console.log(`Received screen share from user ${userId}`);
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === userId ? { ...p, screenStream: stream } : p
            )
          );
        },
        onParticipantStateUpdate: (userId, audioEnabled, videoEnabled) => {
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === userId
                ? { ...p, audio: audioEnabled, video: videoEnabled }
                : p
            )
          );
        },
        onHandRaiseUpdate: (userId, handRaised) => {
          setParticipants((prev) =>
            prev.map((p) => (p.id === userId ? { ...p, handRaised } : p))
          );
        },
      });

      // Get local stream and set up video element
      const stream = webrtcService.getInstance().getCurrentLocalStream();
      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        setLocalStream(stream);

        // Set initial audio/video states
        setAudioEnabled(webrtcService.getInstance().isAudioEnabled());
        setVideoEnabled(webrtcService.getInstance().isVideoEnabled());
      }

      toast.success("Connected to live session!");
    } catch (error) {
      console.error("Failed to initialize WebRTC:", error);
      toast.error("Failed to connect to live session");
    }
  };

  // Poll for live session updates when session is ongoing
  useEffect(() => {
    if (sessionState === "live" && sessionId) {
      const interval = setInterval(async () => {
        try {
          // Update session details to get latest participant info
          const updatedSession = await sessionAPI.getSessionDetails(sessionId);
          setSession(updatedSession);

          // Update participants list with latest data
          const updatedParticipants =
            updatedSession.participants?.map((p) => ({
              id: p.user.id,
              name: `${p.user.first_name} ${p.user.last_name}`,
              role: p.user.role || "student",
              audio: false, // This will be updated by WebRTC callbacks
              video: false, // This will be updated by WebRTC callbacks
              handRaised: false, // This will be updated by WebRTC callbacks
              user: p.user,
            })) || [];

          // Add creator if not already in participants
          if (
            updatedSession.creator &&
            !updatedParticipants.find((p) => p.id === updatedSession.creator.id)
          ) {
            updatedParticipants.unshift({
              id: updatedSession.creator.id,
              name: `${updatedSession.creator.first_name} ${updatedSession.creator.last_name}`,
              role: updatedSession.creator.role || "instructor",
              audio: false,
              video: false,
              handRaised: false,
              user: updatedSession.creator,
            });
          }

          setParticipants(updatedParticipants);
        } catch (error) {
          console.log("Error updating session data:", error);
        }
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [sessionState, sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("=== LIVE SESSION DEBUG ===");
      console.log("Session ID:", sessionId);
      console.log("User:", user);
      console.log(
        "API Base URL:",
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      );

      // Check authentication
      const token = localStorage.getItem("authToken");
      console.log("Auth token exists:", !!token);

      // Wait for user to be loaded if it's null
      if (!user) {
        console.log("⚠️ User is null, waiting for auth context to load...");
        // Wait a bit for auth context to load
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("User after wait:", user);
      }

      // First, let's check if we can get any sessions at all
      try {
        const allSessions = await sessionAPI.getSessions();
        console.log("✅ All sessions response:", allSessions);
        console.log(
          "Available session IDs:",
          allSessions.results.map((s) => s.id)
        );

        // Check if the requested session ID exists
        const sessionExists = allSessions.results.some(
          (s) => s.id === sessionId
        );
        console.log(`Session ID ${sessionId} exists:`, sessionExists);

        if (!sessionExists && allSessions.results.length > 0) {
          console.log(
            "⚠️ Requested session doesn't exist. Available sessions:"
          );
          allSessions.results.forEach((s) => {
            console.log(`- Session ${s.id}: ${s.title} (${s.status})`);
          });
        }
      } catch (allSessionsError) {
        console.log("❌ Error getting all sessions:", allSessionsError);
      }

      const sessionData = await sessionAPI.getSessionDetails(sessionId);
      console.log("✅ Session data received:", sessionData);
      setSession(sessionData);

      // Get current user from localStorage if auth context is not loaded
      let currentUser = user;
      if (!currentUser) {
        try {
          const userData = localStorage.getItem("user");
          if (userData) {
            currentUser = JSON.parse(userData);
            console.log("✅ Retrieved user from localStorage:", currentUser);
          }
        } catch (e) {
          console.log("❌ Error parsing user from localStorage:", e);
        }
      }

      // Check user permissions
      const creator = sessionData.creator?.id === currentUser?.id;
      const joined = sessionData.participants?.some(
        (p) => p.user.id === currentUser?.id
      );

      console.log("Current user ID:", currentUser?.id);
      console.log("Creator ID:", sessionData.creator?.id);
      console.log("Is creator:", creator);
      console.log("Is joined:", joined);

      setIsCreator(creator);
      setIsJoined(joined);

      // Determine session state - for testing, let's show live interface even for approved sessions
      if (
        sessionData.status === "ongoing" ||
        sessionData.status === "approved"
      ) {
        setSessionState("live");
      } else if (sessionData.status === "completed") {
        setSessionState("ended");
      } else {
        setSessionState("waiting");
      }

      // Initialize participants list
      const initialParticipants =
        sessionData.participants?.map((p) => ({
          id: p.user.id,
          name: `${p.user.first_name} ${p.user.last_name}`,
          role: p.user.role || "student",
          audio: false,
          video: false,
          handRaised: false,
          user: p.user,
        })) || [];

      // Add creator if not already in participants
      if (
        sessionData.creator &&
        !initialParticipants.find((p) => p.id === sessionData.creator.id)
      ) {
        initialParticipants.unshift({
          id: sessionData.creator.id,
          name: `${sessionData.creator.first_name} ${sessionData.creator.last_name}`,
          role: sessionData.creator.role || "instructor",
          audio: false,
          video: false,
          handRaised: false,
          user: sessionData.creator,
        });
      }

      setParticipants(initialParticipants);
    } catch (err) {
      console.error("❌ Failed to fetch session details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load session details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    try {
      console.log("🚀 Starting session...");
      const updatedSession = await sessionAPI.startSession(sessionId);
      setSession(updatedSession);
      setSessionState("live");
      console.log("✅ Session started successfully");
      toast.success("Session started!");
    } catch (err) {
      console.error("❌ Failed to start session:", err);
      setError(err instanceof Error ? err.message : "Failed to start session");
      toast.error("Failed to start session");
    }
  };

  const handleJoinSession = async () => {
    try {
      console.log("🎯 Joining session...");
      const updatedSession = await sessionAPI.joinLiveSession(sessionId);
      setSession(updatedSession);
      setIsJoined(true);
      console.log("✅ Joined session successfully");
      toast.success("Joined session!");
    } catch (err) {
      console.error("❌ Failed to join session:", err);
      setError(err instanceof Error ? err.message : "Failed to join session");
      toast.error("Failed to join session");
    }
  };

  const handleLeaveSession = async () => {
    try {
      console.log("👋 Leaving session...");
      await sessionAPI.leaveLiveSession(sessionId);
      setIsJoined(false);
      console.log("✅ Left session successfully");
      toast.success("Left session");
    } catch (err) {
      console.error("❌ Failed to leave session:", err);
      setError(err instanceof Error ? err.message : "Failed to leave session");
      toast.error("Failed to leave session");
    }
  };

  const handleEndSession = async () => {
    try {
      console.log("🛑 Ending session...");
      const updatedSession = await sessionAPI.endSession(sessionId);
      setSession(updatedSession);
      setSessionState("ended");
      console.log("✅ Session ended successfully");
      toast.success("Session ended");
    } catch (err) {
      console.error("❌ Failed to end session:", err);
      setError(err instanceof Error ? err.message : "Failed to end session");
      toast.error("Failed to end session");
    }
  };

  const toggleAudio = async () => {
    try {
      await webrtcService.getInstance().toggleAudio(!audioEnabled);

      // Update local state based on actual WebRTC state
      const newAudioState = webrtcService.getInstance().isAudioEnabled();
      setAudioEnabled(newAudioState);

      // Update local stream display
      const stream = webrtcService.getInstance().getCurrentLocalStream();
      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        setLocalStream(stream);
      }
    } catch (error) {
      console.error("Failed to toggle audio:", error);
      // Don't show error toast as the WebRTC service already shows appropriate messages
    }
  };

  const toggleVideo = async () => {
    try {
      await webrtcService.getInstance().toggleVideo(!videoEnabled);

      // Update local state based on actual WebRTC state
      const newVideoState = webrtcService.getInstance().isVideoEnabled();
      setVideoEnabled(newVideoState);

      // Update local stream display
      const stream = webrtcService.getInstance().getCurrentLocalStream();
      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        setLocalStream(stream);
      }
    } catch (error) {
      console.error("Failed to toggle video:", error);
      // Don't show error toast as the WebRTC service already shows appropriate messages
    }
  };

  const toggleHandRaise = () => {
    const currentUserId =
      user?.id ||
      (() => {
        try {
          const userData = localStorage.getItem("user");
          return userData ? JSON.parse(userData).id : null;
        } catch {
          return null;
        }
      })();
    webrtcService
      .getInstance()
      .sendHandRaiseUpdate(
        !participants.find((p) => p.id === currentUserId)?.handRaised
      );
  };

  const removeParticipant = (participantId: number) => {
    if (isCreator) {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      console.log(`👤 Removed participant ${participantId}`);
      toast.success("Participant removed");
    }
  };

  const muteAllParticipants = () => {
    if (isCreator) {
      setParticipants((prev) => prev.map((p) => ({ ...p, audio: false })));
      console.log("🔇 Muted all participants");
      toast.success("All participants muted");
    }
  };

  const unmuteAllParticipants = () => {
    if (isCreator) {
      setParticipants((prev) => prev.map((p) => ({ ...p, audio: true })));
      console.log("🔊 Unmuted all participants");
      toast.success("All participants unmuted");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Link
            href="/sessions"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Session Not Found
          </h2>
          <p className="text-gray-300 mb-4">
            The session you're looking for doesn't exist.
          </p>
          <Link
            href="/sessions"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/sessions"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {session.title}
              </h1>
              <p className="text-sm text-gray-400">
                {sessionState === "live"
                  ? "Live"
                  : sessionState === "ended"
                  ? "Ended"
                  : "Waiting"}
                {session.date && (
                  <span className="ml-2">
                    • {formatTimeForDisplay(utcToLocal(session.date))}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {sessionState === "live" && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FiUsers className="w-4 h-4" />
                <span>{participants.length} participants</span>
              </div>
            )}

            {isCreator && sessionState === "live" && (
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                End Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {sessionState === "waiting" && (
            <WaitingRoom
              session={session}
              isCreator={isCreator}
              isJoined={isJoined}
              onStartSession={handleStartSession}
              onJoinSession={handleJoinSession}
            />
          )}

          {sessionState === "live" && (
            <LiveSessionView
              session={session}
              participants={participants}
              isCreator={isCreator}
              audioEnabled={audioEnabled}
              videoEnabled={videoEnabled}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onToggleHandRaise={toggleHandRaise}
              onRemoveParticipant={removeParticipant}
              onMuteAll={muteAllParticipants}
              onUnmuteAll={unmuteAllParticipants}
              localVideoRef={localVideoRef}
              remoteVideosRef={remoteVideosRef}
              currentUserId={user?.id || null}
            />
          )}

          {sessionState === "ended" && <SessionEnded session={session} />}
        </div>

        {/* Sidebar */}
        {sessionState === "live" && (
          <SessionSidebar
            participants={participants}
            isCreator={isCreator}
            onRemoveParticipant={removeParticipant}
            onMuteAll={muteAllParticipants}
            onUnmuteAll={unmuteAllParticipants}
          />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
        />
      )}
    </div>
  );
};

// Waiting Room Component
const WaitingRoom = ({
  session,
  isCreator,
  isJoined,
  onStartSession,
  onJoinSession,
}: {
  session: Session;
  isCreator: boolean;
  isJoined: boolean;
  onStartSession: () => void;
  onJoinSession: () => void;
}) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="bg-gray-800 rounded-lg p-8">
        <FiClock className="w-16 h-16 text-primary-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Waiting Room</h2>
        <p className="text-gray-400 mb-6">
          {isCreator
            ? "You're the session creator. Start the session when you're ready."
            : "Waiting for the instructor to start the session."}
        </p>

        {isCreator ? (
          <button
            onClick={onStartSession}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Start Session
          </button>
        ) : !isJoined ? (
          <button
            onClick={onJoinSession}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Join Session
          </button>
        ) : (
          <p className="text-green-400">
            You've joined the session. Waiting for it to start...
          </p>
        )}
      </div>
    </div>
  </div>
);

// Live Session View Component
const LiveSessionView = ({
  session,
  participants,
  isCreator,
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onToggleHandRaise,
  onRemoveParticipant,
  onMuteAll,
  onUnmuteAll,
  localVideoRef,
  remoteVideosRef,
  currentUserId,
}: {
  session: Session;
  participants: Participant[];
  isCreator: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleHandRaise: () => void;
  onRemoveParticipant: (id: number) => void;
  onMuteAll: () => void;
  onUnmuteAll: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideosRef: React.MutableRefObject<{ [key: number]: HTMLVideoElement }>;
  currentUserId: number | null;
}) => (
  <div className="flex-1 flex flex-col">
    {/* Video Grid */}
    <div className="flex-1 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm text-white">
            You (Local)
          </div>
          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <FiVideoOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Camera Off</p>
              </div>
            </div>
          )}
        </div>

        {/* Remote Videos */}
        {typeof window !== "undefined" &&
          participants
            .filter(
              (p) =>
                p.id !==
                (currentUserId ||
                  (() => {
                    try {
                      const userData = localStorage.getItem("user");
                      return userData ? JSON.parse(userData).id : null;
                    } catch {
                      return null;
                    }
                  })())
            )
            .map((participant) => (
              <div
                key={participant.id}
                className="relative bg-gray-800 rounded-lg overflow-hidden"
              >
                <video
                  ref={(el) => {
                    if (el) remoteVideosRef.current[participant.id] = el;
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm text-white">
                  {participant.name}
                </div>
                {!participant.video && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <FiVideoOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Camera Off</p>
                    </div>
                  </div>
                )}
                {participant.handRaised && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                    ✋
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>

    {/* Controls */}
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onToggleAudio}
          className={`p-3 rounded-full ${
            audioEnabled
              ? "bg-gray-600 text-white hover:bg-gray-500"
              : "bg-red-600 text-white hover:bg-red-500"
          } transition-colors`}
        >
          {audioEnabled ? (
            <FiMic className="w-5 h-5" />
          ) : (
            <FiMicOff className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={onToggleVideo}
          className={`p-3 rounded-full ${
            videoEnabled
              ? "bg-gray-600 text-white hover:bg-gray-500"
              : "bg-red-600 text-white hover:bg-red-500"
          } transition-colors`}
        >
          {videoEnabled ? (
            <FiVideo className="w-5 h-5" />
          ) : (
            <FiVideoOff className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={onToggleHandRaise}
          className="p-3 rounded-full bg-gray-600 text-white hover:bg-gray-500 transition-colors"
        >
          ✋
        </button>

        {isCreator && (
          <>
            <button
              onClick={onMuteAll}
              className="p-3 rounded-full bg-gray-600 text-white hover:bg-gray-500 transition-colors"
            >
              <FiVolumeX className="w-5 h-5" />
            </button>
            <button
              onClick={onUnmuteAll}
              className="p-3 rounded-full bg-gray-600 text-white hover:bg-gray-500 transition-colors"
            >
              <FiVolume2 className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);

// Session Sidebar Component
const SessionSidebar = ({
  participants,
  isCreator,
  onRemoveParticipant,
  onMuteAll,
  onUnmuteAll,
}: {
  participants: Participant[];
  isCreator: boolean;
  onRemoveParticipant: (id: number) => void;
  onMuteAll: () => void;
  onUnmuteAll: () => void;
}) => (
  <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
    <div className="p-4 border-b border-gray-700">
      <h3 className="text-lg font-semibold text-white">Participants</h3>
      <p className="text-sm text-gray-400">{participants.length} online</p>
    </div>

    <div className="flex-1 overflow-y-auto p-4">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{participant.name}</p>
              <p className="text-xs text-gray-400 capitalize">
                {participant.role}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {participant.audio ? (
              <FiMic className="w-4 h-4 text-green-400" />
            ) : (
              <FiMicOff className="w-4 h-4 text-red-400" />
            )}
            {participant.video ? (
              <FiVideo className="w-4 h-4 text-green-400" />
            ) : (
              <FiVideoOff className="w-4 h-4 text-red-400" />
            )}
            {participant.handRaised && (
              <span className="text-yellow-500">✋</span>
            )}
            {isCreator && participant.role !== "instructor" && (
              <button
                onClick={() => onRemoveParticipant(participant.id)}
                className="text-red-400 hover:text-red-300"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Session Ended Component
const SessionEnded = ({ session }: { session: Session }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="bg-gray-800 rounded-lg p-8">
        <FiCheck className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Session Ended</h2>
        <p className="text-gray-400 mb-6">
          This session has ended. Thank you for participating!
        </p>
        <Link
          href="/sessions"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Sessions
        </Link>
      </div>
    </div>
  </div>
);

// Settings Modal Component
const SettingsModal = ({
  onClose,
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
}: {
  onClose: () => void;
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Settings</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white">Microphone</span>
          <button
            onClick={onToggleAudio}
            className={`px-3 py-1 rounded ${
              audioEnabled ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {audioEnabled ? "On" : "Off"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white">Camera</span>
          <button
            onClick={onToggleVideo}
            className={`px-3 py-1 rounded ${
              videoEnabled ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {videoEnabled ? "On" : "Off"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default LiveSessionPage;

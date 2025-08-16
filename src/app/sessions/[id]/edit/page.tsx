"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { SessionForm } from "@/components/SessionForm";
import { Session } from "@/types";
import { sessionAPI } from "@/lib/sessionAPI";
import { useAuth } from "@/contexts/AuthContext";

const EditSessionPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const sessionId = parseInt(params.id as string);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await sessionAPI.getSessionDetails(sessionId);

      // Check if user is the creator of the session
      if (sessionData.creator?.id !== user?.id) {
        setError("You don't have permission to edit this session");
        return;
      }

      setSession(sessionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (updatedSession: Session) => {
    // Redirect to the session details page after successful update
    router.push(`/sessions/${updatedSession.id}`);
  };

  const handleCancel = () => {
    // Go back to session details
    router.push(`/sessions/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading session...</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error ? "Error Loading Session" : "Session Not Found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {error || "The session you're looking for doesn't exist."}
              </p>
              <button
                onClick={() => router.push("/sessions")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Back to Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Session</h1>
          <p className="mt-2 text-gray-600">
            Update your session details and settings
          </p>
        </div>

        <SessionForm
          session={session}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditSessionPage;

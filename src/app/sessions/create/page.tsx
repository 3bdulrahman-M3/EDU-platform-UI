"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { sessionAPI } from "@/lib/sessionAPI";
import SessionForm from "@/components/SessionForm";

const CreateSessionPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    date: string;
    max_participants: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      await sessionAPI.createSession(formData);
      router.push("/sessions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/sessions"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Sessions
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎓 Create New Session
          </h1>
          <p className="text-gray-600">
            Schedule a tutoring session and invite participants to join
          </p>
        </div>

        {/* Error Message */}
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

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SessionForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            💡 Tips for creating great sessions:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Use clear, descriptive titles that explain what will be covered
            </li>
            <li>
              • Provide detailed descriptions to help participants understand
              the content
            </li>
            <li>
              • Choose appropriate participant limits based on the session type
            </li>
            <li>
              • Schedule sessions at times that work for your target audience
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionPage;

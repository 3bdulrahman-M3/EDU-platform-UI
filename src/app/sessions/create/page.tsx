"use client";

import { useRouter } from "next/navigation";
import { SessionForm } from "@/components/SessionForm";
import { Session } from "@/types";

const CreateSessionPage = () => {
  const router = useRouter();

  const handleSubmit = (session: Session) => {
    console.log("Session created, navigating to:", session.id);

    // Validate session has an ID before navigating
    if (!session || !session.id) {
      console.error("Cannot navigate - session missing ID:", session);
      return;
    }

    // Redirect to the session details page after successful creation
    router.push(`/sessions/${session.id}`);
  };

  const handleCancel = () => {
    // Go back to sessions list
    router.push("/sessions");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Session
          </h1>
          <p className="mt-2 text-gray-600">
            Set up a new peer-to-peer learning session
          </p>
        </div>

        <SessionForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default CreateSessionPage;

import { Participant } from "@/types";
import { FiUser } from "react-icons/fi";

interface ParticipantListProps {
  participants: Participant[];
  maxParticipants?: number;
}

const ParticipantList = ({
  participants,
  maxParticipants,
}: ParticipantListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    return role === "tutor" ? "bg-purple-500" : "bg-blue-500";
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">
        Participants ({participants.length}
        {maxParticipants && `/${maxParticipants}`})
      </h3>

      {participants.length === 0 ? (
        <p className="text-sm text-gray-500">No participants yet</p>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className={`w-8 h-8 rounded-full ${getRoleColor(
                    participant.role
                  )} flex items-center justify-center text-white text-sm font-medium`}
                >
                  {getInitials(
                    participant.user.first_name,
                    participant.user.last_name
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-gray-200">
                  <div
                    className={`w-full h-full rounded-full ${getRoleColor(
                      participant.role
                    )}`}
                  ></div>
                </div>
              </div>

              {/* Participant Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {participant.user.first_name} {participant.user.last_name}
                  </p>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      participant.role === "tutor"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {participant.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Joined {formatDate(participant.joined_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantList;

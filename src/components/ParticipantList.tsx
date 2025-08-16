import { Participant } from "@/types";
import { FiUser } from "react-icons/fi";

interface ParticipantListProps {
  participants: Participant[];
  maxDisplay?: number;
  showCount?: boolean;
}

const ParticipantList = ({
  participants,
  maxDisplay = 5,
  showCount = true,
}: ParticipantListProps) => {
  const displayedParticipants = participants.slice(0, maxDisplay);
  const remainingCount = participants.length - maxDisplay;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (participants.length === 0) {
    return <div className="text-sm text-gray-500">No participants yet</div>;
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {displayedParticipants.map((participant, index) => (
          <div
            key={participant.id}
            className={`
              relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white
              ${getAvatarColor(
                participant.user.first_name + participant.user.last_name
              )}
              text-white text-xs font-medium
            `}
            title={`${participant.user.first_name} ${participant.user.last_name} (${participant.role})`}
          >
            {getInitials(
              participant.user.first_name,
              participant.user.last_name
            )}
            {participant.status === "pending" && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 border-2 border-white rounded-full"></div>
            )}
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-gray-300 text-gray-600 text-xs font-medium">
            +{remainingCount}
          </div>
        )}
      </div>

      {showCount && (
        <span className="text-sm text-gray-600">
          {participants.length} participant
          {participants.length !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
};

export default ParticipantList;

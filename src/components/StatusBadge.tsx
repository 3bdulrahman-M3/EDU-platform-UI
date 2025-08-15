import { Session } from "@/types";

interface StatusBadgeProps {
  status: Session["status"];
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: Session["status"]) => {
    switch (status) {
      case "upcoming":
        return {
          label: "Upcoming",
          className: "bg-blue-100 text-blue-800",
        };
      case "ongoing":
        return {
          label: "Ongoing",
          className: "bg-green-100 text-green-800",
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-gray-100 text-gray-800",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          label: "Unknown",
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;

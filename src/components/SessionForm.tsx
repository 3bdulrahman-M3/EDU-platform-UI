"use client";

import { useState } from "react";
import { FiCalendar, FiClock, FiUsers, FiFileText } from "react-icons/fi";

interface SessionFormData {
  title: string;
  description: string;
  date: string;
  max_participants: number;
}

interface SessionFormProps {
  onSubmit: (data: SessionFormData) => Promise<void>;
  isLoading?: boolean;
}

const SessionForm = ({ onSubmit, isLoading = false }: SessionFormProps) => {
  const [formData, setFormData] = useState<SessionFormData>({
    title: "",
    description: "",
    date: "",
    max_participants: 6,
  });

  const [errors, setErrors] = useState<Partial<SessionFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SessionFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.date) {
      newErrors.date = "Date and time is required";
    } else {
      const selectedDate = new Date(formData.date);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.date = "Session must be scheduled for a future date and time";
      }
    }

    if (formData.max_participants < 2) {
      newErrors.max_participants = "Minimum 2 participants required";
    } else if (formData.max_participants > 20) {
      newErrors.max_participants = "Maximum 20 participants allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleInputChange = (
    field: keyof SessionFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <FiFileText className="inline w-4 h-4 mr-1" />
          Session Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.title ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Enter session title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <FiFileText className="inline w-4 h-4 mr-1" />
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Describe what this session will cover..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Date and Time */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <FiCalendar className="inline w-4 h-4 mr-1" />
          Date and Time
        </label>
        <input
          type="datetime-local"
          id="date"
          value={formData.date}
          onChange={(e) => handleInputChange("date", e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.date ? "border-red-300" : "border-gray-300"
          }`}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
        )}
      </div>

      {/* Max Participants */}
      <div>
        <label
          htmlFor="max_participants"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <FiUsers className="inline w-4 h-4 mr-1" />
          Maximum Participants
        </label>
        <input
          type="number"
          id="max_participants"
          min="2"
          max="20"
          value={formData.max_participants}
          onChange={(e) =>
            handleInputChange("max_participants", parseInt(e.target.value))
          }
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.max_participants ? "border-red-300" : "border-gray-300"
          }`}
        />
        {errors.max_participants && (
          <p className="mt-1 text-sm text-red-600">{errors.max_participants}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Choose between 2 and 20 participants
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating Session..." : "Create Session"}
        </button>
      </div>
    </form>
  );
};

export default SessionForm;

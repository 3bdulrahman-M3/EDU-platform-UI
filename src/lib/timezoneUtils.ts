/**
 * Timezone utilities for consistent datetime handling
 */

/**
 * Format date with timezone offset for API submission
 * @param date - Date object
 * @returns ISO string with timezone offset (e.g., "2025-08-17T03:00:00+02:00")
 */
export const formatDateWithTimezone = (date: Date): string => {
  // Option 1: Use actual user timezone (current behavior)
  const offset = date.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offset / 60));
  const offsetMinutes = Math.abs(offset % 60);
  const offsetSign = offset <= 0 ? "+" : "-";

  // Option 2: Force UTC (uncomment the next line if you want UTC)
  // return date.toISOString();

  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    "T" +
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0") +
    ":" +
    String(date.getSeconds()).padStart(2, "0") +
    offsetSign +
    String(offsetHours).padStart(2, "0") +
    ":" +
    String(offsetMinutes).padStart(2, "0")
  );
};

/**
 * Convert UTC datetime to local datetime for display
 * @param utcDateTime - UTC datetime string
 * @returns Local datetime string for display
 */
export const utcToLocal = (utcDateTime: string): Date => {
  return new Date(utcDateTime);
};

/**
 * Get current timezone offset in minutes
 * @returns Timezone offset in minutes
 */
export const getCurrentTimezoneOffset = (): number => {
  return new Date().getTimezoneOffset();
};

/**
 * Get current timezone name
 * @returns Timezone name (e.g., "America/New_York")
 */
export const getCurrentTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Format date for display with smart "Today"/"Tomorrow" labels
 * @param date - Date object
 * @returns Formatted date string
 */
export const formatDateForDisplay = (date: Date): string => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow =
    date.toDateString() ===
    new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

  if (isToday) {
    return "Today";
  } else if (isTomorrow) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

/**
 * Format time for display
 * @param date - Date object
 * @returns Formatted time string
 */
export const formatTimeForDisplay = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
};

/**
 * Check if date is in the future
 * @param date - Date string or Date object
 * @returns boolean
 */
export const isFutureDate = (date: string | Date): boolean => {
  return new Date(date) > new Date();
};

/**
 * Validate ISO format with timezone
 * @param dateString - Date string to validate
 * @returns boolean
 */
export const isValidISOFormat = (dateString: string): boolean => {
  const isoRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)$/;
  return isoRegex.test(dateString);
};

/**
 * Create session payload with proper timezone formatting
 * @param title - Session title
 * @param description - Session description
 * @param date - Date object
 * @param maxParticipants - Maximum participants
 * @returns Session payload object
 */
export const createSessionPayload = (
  title: string,
  description: string,
  date: Date,
  maxParticipants: number
) => {
  return {
    title: title,
    description: description,
    date: formatDateWithTimezone(date),
    max_participants: maxParticipants,
  };
};

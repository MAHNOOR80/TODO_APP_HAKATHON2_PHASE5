/**
 * Date Formatting Utilities
 * Formats ISO timestamps to user-friendly strings
 */

/**
 * Format ISO date string to readable format
 * @param isoString - ISO 8601 date string
 * @returns Formatted date string (e.g., "Jan 15, 2024 at 3:30 PM")
 */
export function formatDate(isoString: string | null): string {
  if (!isoString) return 'No due date';

  const date = new Date(isoString);

  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Check if it's today
  if (dateOnly.getTime() === today.getTime()) {
    return `Today at ${formatTime(date)}`;
  }

  // Check if it's tomorrow
  if (dateOnly.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${formatTime(date)}`;
  }

  // Check if it's within the next 7 days
  const daysUntil = Math.floor((dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil > 0 && daysUntil < 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayName} at ${formatTime(date)}`;
  }

  // Default format: "Jan 15, 2024 at 3:30 PM"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ` at ${formatTime(date)}`;
}

/**
 * Format time portion of date
 * @param date - Date object
 * @returns Formatted time string (e.g., "3:30 PM")
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for display in short form
 * @param isoString - ISO 8601 date string
 * @returns Short formatted date (e.g., "Jan 15")
 */
export function formatDateShort(isoString: string | null): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if a date is overdue
 * @param isoString - ISO 8601 date string
 * @param completed - Whether the task is completed
 * @returns True if the date is in the past and task is not completed
 */
export function isOverdue(isoString: string | null, completed: boolean): boolean {
  if (!isoString || completed) return false;

  const dueDate = new Date(isoString);
  const now = new Date();

  return dueDate.getTime() < now.getTime();
}

/**
 * Get relative time description (e.g., "in 2 days", "3 hours ago")
 * @param isoString - ISO 8601 date string
 * @returns Relative time string
 */
export function getRelativeTime(isoString: string | null): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
  const diffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
  const diffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));

  const isPast = diffMs < 0;
  const prefix = isPast ? '' : 'in ';
  const suffix = isPast ? ' ago' : '';

  if (diffMinutes < 60) {
    return `${prefix}${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}${suffix}`;
  } else if (diffHours < 24) {
    return `${prefix}${diffHours} hour${diffHours !== 1 ? 's' : ''}${suffix}`;
  } else {
    return `${prefix}${diffDays} day${diffDays !== 1 ? 's' : ''}${suffix}`;
  }
}

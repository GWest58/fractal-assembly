/**
 * Date and time utilities with proper timezone handling
 */

export class DateUtils {
  /**
   * Format a date for display in the user's local timezone
   */
  static formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  }

  /**
   * Format a time for display in the user's local timezone
   */
  static formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return dateObj.toLocaleTimeString('en-US', { ...defaultOptions, ...options });
  }

  /**
   * Format a full date and time for display in the user's local timezone
   */
  static formatDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return dateObj.toLocaleString('en-US', { ...defaultOptions, ...options });
  }

  /**
   * Format a time in a compact format (e.g., "2:30 PM")
   */
  static formatCompactTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Format a time in a very compact format (e.g., "2:30p")
   */
  static formatVeryCompactTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    // Convert "2:30 PM" to "2:30p"
    return timeStr.replace(' PM', 'p').replace(' AM', 'a');
  }

  /**
   * Format a relative time (e.g., "2 hours ago", "just now")
   */
  static formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      // For longer periods, show the actual date
      return DateUtils.formatDate(dateObj, { month: 'short', day: 'numeric' });
    }
  }

  /**
   * Check if a date is today in the user's local timezone
   */
  static isToday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();

    return (
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate()
    );
  }

  /**
   * Check if a date is yesterday in the user's local timezone
   */
  static isYesterday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return (
      dateObj.getFullYear() === yesterday.getFullYear() &&
      dateObj.getMonth() === yesterday.getMonth() &&
      dateObj.getDate() === yesterday.getDate()
    );
  }

  /**
   * Get the current date in YYYY-MM-DD format (local timezone)
   */
  static getTodayString(): string {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
  }

  /**
   * Convert a Date to YYYY-MM-DD format in local timezone
   */
  static toDateString(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
  }

  /**
   * Smart format that shows relative time for recent dates, full format for older dates
   */
  static formatSmart(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (DateUtils.isToday(dateObj)) {
      return `Today at ${DateUtils.formatCompactTime(dateObj)}`;
    } else if (DateUtils.isYesterday(dateObj)) {
      return `Yesterday at ${DateUtils.formatCompactTime(dateObj)}`;
    } else {
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 7) {
        return DateUtils.formatRelativeTime(dateObj);
      } else {
        return DateUtils.formatDateTime(dateObj);
      }
    }
  }

  /**
   * Parse a duration string and return seconds
   */
  static parseDuration(input: string): number {
    const normalizedInput = input.toLowerCase().trim();

    // Handle formats like "1:30" (1 minute 30 seconds) or "0:05:30" (5 minutes 30 seconds)
    const timeMatch = normalizedInput.match(/^(\d+):(\d+)(?::(\d+))?$/);
    if (timeMatch) {
      const [, hours, minutes, seconds] = timeMatch;
      if (seconds !== undefined) {
        // Format: H:MM:SS
        return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
      } else {
        // Format: M:SS
        return parseInt(hours) * 60 + parseInt(minutes);
      }
    }

    let totalSeconds = 0;

    // Extract hours
    const hourMatch = normalizedInput.match(/(\d+)\s*(?:h|hr|hour|hours)/);
    if (hourMatch) {
      totalSeconds += parseInt(hourMatch[1]) * 3600;
    }

    // Extract minutes
    const minuteMatch = normalizedInput.match(/(\d+)\s*(?:m|min|minute|minutes)/);
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60;
    }

    // Extract seconds
    const secondMatch = normalizedInput.match(/(\d+)\s*(?:s|sec|second|seconds)/);
    if (secondMatch) {
      totalSeconds += parseInt(secondMatch[1]);
    }

    // If no time unit is specified, assume minutes
    if (totalSeconds === 0) {
      const numberMatch = normalizedInput.match(/^\d+$/);
      if (numberMatch) {
        totalSeconds = parseInt(numberMatch[0]) * 60;
      }
    }

    return totalSeconds;
  }

  /**
   * Format seconds into a human-readable duration string
   */
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
}

export default DateUtils;

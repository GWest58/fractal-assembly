/**
 * Timezone utilities for handling date ranges and conversions
 */

export class TimezoneUtils {
  /**
   * Calculate UTC start and end times for a local date
   * @param {string} localDate - Date in YYYY-MM-DD format (user's local date)
   * @param {number} timezoneOffset - Timezone offset in minutes (from getTimezoneOffset())
   * @returns {Object} - { startOfDay, endOfDay } in UTC ISO strings
   */
  static getUTCDayRange(localDate, timezoneOffset) {
    // Create date object treating the input as UTC midnight, then apply offset
    // This avoids timezone interpretation issues with Date constructor
    const utcMidnight = new Date(`${localDate}T00:00:00.000Z`);

    // Apply timezone offset to get the actual UTC time for user's local midnight
    // Note: getTimezoneOffset() returns positive values for timezones west of UTC
    // So we add the offset to convert user's local time to UTC
    const utcStartOfDay = new Date(
      utcMidnight.getTime() + timezoneOffset * 60 * 1000,
    );

    // End of day is start of next day
    const utcEndOfDay = new Date(utcStartOfDay.getTime() + 24 * 60 * 60 * 1000);

    return {
      startOfDay: utcStartOfDay.toISOString(),
      endOfDay: utcEndOfDay.toISOString(),
    };
  }

  /**
   * Calculate UTC start and end times for a local date using timezone name
   * @param {string} localDate - Date in YYYY-MM-DD format
   * @param {string} timezoneName - IANA timezone name (e.g., 'America/Los_Angeles')
   * @returns {Object} - { startOfDay, endOfDay } in UTC ISO strings
   */
  static getUTCDayRangeByTimezone(localDate, timezoneName = "UTC") {
    try {
      // Create a date object for midnight in the specified timezone
      const localMidnight = new Date(`${localDate}T00:00:00`);

      // Use Intl.DateTimeFormat to get the UTC offset for this date in the timezone
      const formatter = new Intl.DateTimeFormat("en", {
        timeZone: timezoneName,
        timeZoneName: "longOffset",
      });

      const parts = formatter.formatToParts(localMidnight);
      const offsetPart = parts.find((part) => part.type === "timeZoneName");

      if (offsetPart) {
        // Parse offset like "GMT-08:00" or "GMT+05:30"
        const offsetMatch = offsetPart.value.match(/GMT([+-])(\d{2}):(\d{2})/);
        if (offsetMatch) {
          const sign = offsetMatch[1] === "+" ? 1 : -1;
          const hours = parseInt(offsetMatch[2]);
          const minutes = parseInt(offsetMatch[3]);
          const offsetMinutes = sign * (hours * 60 + minutes);

          return this.getUTCDayRange(localDate, offsetMinutes);
        }
      }

      // Fallback: treat as UTC
      return this.getUTCDayRange(localDate, 0);
    } catch (error) {
      console.warn("Timezone calculation failed, falling back to UTC:", error);
      return this.getUTCDayRange(localDate, 0);
    }
  }

  /**
   * Simple version: calculate UTC range from local date string
   * Assumes the client will send their local date and we'll approximate
   * @param {string} localDate - Date in YYYY-MM-DD format
   * @returns {Object} - { startOfDay, endOfDay } in UTC ISO strings
   */
  static getUTCDayRangeSimple(localDate) {
    const startOfDay = `${localDate}T00:00:00.000Z`;
    const endOfDay = `${localDate}T23:59:59.999Z`;

    return { startOfDay, endOfDay };
  }

  /**
   * Get current local date string for server timezone
   * @returns {string} - Date in YYYY-MM-DD format
   */
  static getCurrentLocalDate() {
    const now = new Date();
    return now.toLocaleDateString("en-CA"); // en-CA gives YYYY-MM-DD format
  }

  /**
   * Convert a UTC timestamp to local date string
   * @param {string|Date} utcTimestamp - UTC timestamp
   * @param {number} timezoneOffset - Timezone offset in minutes
   * @returns {string} - Date in YYYY-MM-DD format
   */
  static utcToLocalDate(utcTimestamp, timezoneOffset) {
    const utcDate =
      typeof utcTimestamp === "string" ? new Date(utcTimestamp) : utcTimestamp;
    const localDate = new Date(utcDate.getTime() - timezoneOffset * 60 * 1000);
    return localDate.toLocaleDateString("en-CA");
  }

  /**
   * Parse client date range parameters
   * @param {Object} params - Request parameters
   * @param {string} params.date - Local date string (YYYY-MM-DD)
   * @param {number} params.timezoneOffset - Optional timezone offset in minutes
   * @param {string} params.timezone - Optional IANA timezone name
   * @returns {Object} - { startOfDay, endOfDay } in UTC ISO strings
   */
  static parseClientDateRange(params) {
    const { date, timezoneOffset, timezone } = params;

    if (!date) {
      // No date provided, use server's current date
      const currentDate = this.getCurrentLocalDate();
      return this.getUTCDayRangeSimple(currentDate);
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }

    // Use timezone name if provided
    if (timezone) {
      return this.getUTCDayRangeByTimezone(date, timezone);
    }

    // Use timezone offset if provided
    if (typeof timezoneOffset === "number") {
      return this.getUTCDayRange(date, timezoneOffset);
    }

    // Fallback: treat as UTC (simple range)
    return this.getUTCDayRangeSimple(date);
  }

  /**
   * Debug function to show timezone calculations
   * @param {string} localDate - Date in YYYY-MM-DD format
   * @param {number} timezoneOffset - Timezone offset in minutes
   */
  static debugTimezone(localDate, timezoneOffset) {
    const range = this.getUTCDayRange(localDate, timezoneOffset);
    console.log("Timezone Debug:", {
      localDate,
      timezoneOffset: `${timezoneOffset} minutes`,
      timezoneHours: `UTC${timezoneOffset <= 0 ? "+" : "-"}${Math.abs(timezoneOffset / 60)}`,
      utcRange: range,
      localStartEquivalent: new Date(range.startOfDay).toLocaleString(),
      localEndEquivalent: new Date(range.endOfDay).toLocaleString(),
    });
    return range;
  }
}

export default TimezoneUtils;

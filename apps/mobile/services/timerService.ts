import { TimerStatusResponse } from "../types/Task";

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser environment - use current host but port 3001
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3001/api`;
  }

  // For mobile development - replace with your computer's IP address
  // To find your IP: run `ipconfig getifaddr en0` on Mac or `ipconfig` on Windows
  // Example: "http://192.168.1.100:3001/api"
  const DEVELOPMENT_IP = "192.168.1.157"; // Your computer's IP address

  // Check if running in Expo development
  if (__DEV__ && process.env.NODE_ENV === "development") {
    return `http://${DEVELOPMENT_IP}:3001/api`;
  }

  // Default for mobile/native
  return "http://localhost:3001/api";
};

const API_BASE_URL = getApiBaseUrl();

export class TimerService {
  static async startTimer(taskId: string): Promise<TimerStatusResponse> {
    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/timer/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to start timer");
    }

    const result = await response.json();
    return result.data;
  }

  static async pauseTimer(taskId: string): Promise<TimerStatusResponse> {
    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/timer/pause`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to pause timer");
    }

    const result = await response.json();
    return result.data;
  }

  static async stopTimer(taskId: string): Promise<TimerStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/timer/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to stop timer");
    }

    const result = await response.json();
    return result.data;
  }

  static async getTimerStatus(taskId: string): Promise<TimerStatusResponse> {
    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/timer/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get timer status");
    }

    const result = await response.json();
    return result.data;
  }

  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
  }

  static parseDurationInput(input: string): number {
    // Parse input like "5 minutes", "1 hour", "30 seconds", "1h 30m", etc.
    const normalizedInput = input.toLowerCase().trim();

    // Handle formats like "1:30" (1 minute 30 seconds) or "0:05:30" (5 minutes 30 seconds)
    const timeMatch = normalizedInput.match(/^(\d+):(\d+)(?::(\d+))?$/);
    if (timeMatch) {
      const [, hours, minutes, seconds] = timeMatch;
      if (seconds !== undefined) {
        // Format: H:MM:SS
        return (
          parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
        );
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
    const minuteMatch = normalizedInput.match(
      /(\d+)\s*(?:m|min|minute|minutes)/,
    );
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60;
    }

    // Extract seconds
    const secondMatch = normalizedInput.match(
      /(\d+)\s*(?:s|sec|second|seconds)/,
    );
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
}

export default TimerService;

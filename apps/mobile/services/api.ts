// Determine API base URL based on environment
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser environment - use current host but port 3001
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3001/api`;
  }
  // Default for mobile/native
  return "http://localhost:3001/api";
};

const API_BASE_URL = getApiBaseUrl();

export interface Habit {
  id: string;
  text: string;
  category: "health" | "wellness" | "productivity" | "personal";
  isFoundational: boolean;
  completedToday: boolean;
  lastCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string;
  completionDate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    console.log(`API Client initialized with base URL: ${this.baseUrl}`);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`API request: ${config.method || "GET"} ${url}`);
      const response = await fetch(url, config);

      if (!response.ok) {
        console.error(
          `HTTP ${response.status} ${response.statusText} for ${url}`,
        );
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log(`API response for ${endpoint}:`, data);

      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Habit management methods
  async getHabits(date?: string): Promise<Habit[]> {
    const params = date ? `?date=${date}` : "";
    const response = await this.request<ApiResponse<Habit[]>>(
      `/habits${params}`,
    );
    return response.data || [];
  }

  async getHabit(id: string): Promise<Habit> {
    const response = await this.request<ApiResponse<Habit>>(`/habits/${id}`);
    if (!response.data) {
      throw new Error("Habit not found");
    }
    return response.data;
  }

  async createHabit(habit: {
    text: string;
    category: "health" | "wellness" | "productivity" | "personal";
    isFoundational?: boolean;
  }): Promise<Habit> {
    const response = await this.request<ApiResponse<Habit>>("/habits", {
      method: "POST",
      body: JSON.stringify(habit),
    });
    if (!response.data) {
      throw new Error("Failed to create habit");
    }
    return response.data;
  }

  async updateHabit(
    id: string,
    updates: {
      text?: string;
      category?: "health" | "wellness" | "productivity" | "personal";
    },
  ): Promise<Habit> {
    const response = await this.request<ApiResponse<Habit>>(`/habits/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!response.data) {
      throw new Error("Failed to update habit");
    }
    return response.data;
  }

  async deleteHabit(id: string): Promise<void> {
    await this.request<ApiResponse<void>>(`/habits/${id}`, {
      method: "DELETE",
    });
  }

  // Completion tracking methods
  async markHabitComplete(
    habitId: string,
    completedAt?: string,
  ): Promise<HabitCompletion> {
    const response = await this.request<ApiResponse<HabitCompletion>>(
      `/habits/${habitId}/complete`,
      {
        method: "POST",
        body: JSON.stringify(completedAt ? { completedAt } : {}),
      },
    );
    if (!response.data) {
      throw new Error("Failed to mark habit as complete");
    }
    return response.data;
  }

  async markHabitIncomplete(habitId: string, date?: string): Promise<void> {
    const params = date ? `?date=${date}` : "";
    await this.request<ApiResponse<void>>(
      `/habits/${habitId}/complete${params}`,
      {
        method: "DELETE",
      },
    );
  }

  // Statistics methods
  async getHabitStats(habitId: string, days: number = 30) {
    const response = await this.request<
      ApiResponse<{
        habit: Habit;
        stats: {
          totalDays: number;
          completedDays: number;
          completionRate: number;
          streak: number;
        };
      }>
    >(`/habits/${habitId}/stats?days=${days}`);
    return response.data;
  }

  // Completion queries
  async getTodayCompletions(date?: string): Promise<HabitCompletion[]> {
    const params = date ? `?date=${date}` : "";
    const response = await this.request<ApiResponse<HabitCompletion[]>>(
      `/habits/completions/today${params}`,
    );
    return response.data || [];
  }

  async getCompletionsRange(
    startDate: string,
    endDate: string,
  ): Promise<HabitCompletion[]> {
    const response = await this.request<ApiResponse<HabitCompletion[]>>(
      `/habits/completions/range?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data || [];
  }

  // Utility methods
  async resetDay(date?: string): Promise<{ resetCount: number; date: string }> {
    try {
      console.log("API: Starting daily reset...", { date });

      const requestBody = date ? { date } : {};
      console.log("API: Reset request body:", requestBody);

      const response = await this.request<
        ApiResponse<{
          resetCount: number;
          date: string;
        }>
      >("/habits/reset-day", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      console.log("API: Reset response:", response);

      if (!response.data) {
        throw new Error("Failed to reset day - no data in response");
      }

      console.log("API: Daily reset successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("API: Reset day failed:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to reset day: ${error.message}`);
      }
      throw new Error("Failed to reset day: Unknown error");
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl.replace("/api", "")}/health`,
      );
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the ApiResponse type (already exported above)

// Utility function to format dates for API calls
export const formatDateForApi = (date: Date): string => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
};

// Error handling helper
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Connection helper for development
export const checkApiConnection = async (): Promise<boolean> => {
  return await apiClient.healthCheck();
};

// Debug helper functions
export const debugApi = {
  async testConnection() {
    console.log("🔍 Testing API connection...");
    try {
      const isHealthy = await apiClient.healthCheck();
      console.log("✅ Health check:", isHealthy);
      return isHealthy;
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return false;
    }
  },

  async testGetHabits() {
    console.log("🔍 Testing get habits...");
    try {
      const habits = await apiClient.getHabits();
      console.log("✅ Got habits:", habits);
      return habits;
    } catch (error) {
      console.error("❌ Get habits failed:", error);
      throw error;
    }
  },

  async testResetDay() {
    console.log("🔍 Testing reset day...");
    try {
      const result = await apiClient.resetDay();
      console.log("✅ Reset day result:", result);
      return result;
    } catch (error) {
      console.error("❌ Reset day failed:", error);
      throw error;
    }
  },

  async fullTest() {
    console.log("🧪 Running full API test suite...");
    try {
      await this.testConnection();
      await this.testGetHabits();
      console.log("✅ All basic tests passed!");
    } catch (error) {
      console.error("❌ Test suite failed:", error);
    }
  },
};

// Make debug functions available globally in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).debugApi = debugApi;
  (window as any).apiClient = apiClient;
  console.log("🛠️ Debug tools available: window.debugApi, window.apiClient");
}

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

export interface Task {
  id: string;
  text: string;
  completed?: boolean;
  completedToday: boolean;
  lastCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
  frequency?: {
    type: string;
    data: Record<string, unknown>;
    time?: string;
  };
  durationSeconds?: number;
  timerStartedAt?: string;
  timerStatus?: string;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
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
    console.log(`🔧 API Client initialized with base URL: ${this.baseUrl}`);
    console.log(`🔧 Environment: ${__DEV__ ? "development" : "production"}`);
    console.log(
      `🔧 Platform: ${typeof window !== "undefined" ? "web" : "mobile"}`,
    );
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

  // Task management methods
  async getTasks(date?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (date) {
      params.append("date", date);
    }
    // Add timezone offset for proper date range calculation
    const timezoneOffset = new Date().getTimezoneOffset();
    params.append("timezoneOffset", timezoneOffset.toString());

    const queryString = params.toString();
    const response = await this.request<ApiResponse<Task[]>>(
      `/tasks${queryString ? `?${queryString}` : ""}`,
    );
    return response.data || [];
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.request<ApiResponse<Task>>(`/tasks/${id}`);
    if (!response.data) {
      throw new Error("Task not found");
    }
    return response.data;
  }

  async createTask(task: {
    text: string;
    frequency?: {
      type: string;
      data: Record<string, unknown>;
      time?: string;
    };
    durationSeconds?: number;
    projectId?: string;
  }): Promise<Task> {
    const response = await this.request<ApiResponse<Task>>("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
    if (!response.data) {
      throw new Error("Failed to create task");
    }
    return response.data;
  }

  async updateTask(
    id: string,
    updates: {
      text?: string;
      completed?: boolean;
      frequency?: {
        type: string;
        data: Record<string, unknown>;
        time?: string;
      };
      durationSeconds?: number;
      timerStartedAt?: string;
      timerStatus?: string;
    },
  ): Promise<Task> {
    const response = await this.request<ApiResponse<Task>>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!response.data) {
      throw new Error("Failed to update task");
    }
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.request<ApiResponse<void>>(`/tasks/${id}`, {
      method: "DELETE",
    });
  }

  // Completion tracking methods
  async markTaskComplete(
    taskId: string,
    completedAt?: string,
  ): Promise<TaskCompletion> {
    const body = completedAt ? { completedAt } : {};

    const response = await this.request<ApiResponse<TaskCompletion>>(
      `/tasks/${taskId}/complete`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    if (!response.data) {
      throw new Error("Failed to mark task as complete");
    }
    return response.data;
  }

  async markTaskIncomplete(taskId: string, date?: string): Promise<void> {
    const params = new URLSearchParams();
    if (date) {
      params.append("date", date);
    }
    // Add timezone offset for proper date range calculation
    const timezoneOffset = new Date().getTimezoneOffset();
    params.append("timezoneOffset", timezoneOffset.toString());

    const queryString = params.toString();
    const url = `/tasks/${taskId}/complete${queryString ? `?${queryString}` : ""}`;

    await this.request<ApiResponse<void>>(url, {
      method: "DELETE",
    });
  }

  // Statistics methods
  async getTaskStats(taskId: string, days: number = 30) {
    const response = await this.request<
      ApiResponse<{
        task: Task;
        stats: {
          totalDays: number;
          completedDays: number;
          completionRate: number;
          streak: number;
        };
      }>
    >(`/tasks/${taskId}/stats?days=${days}`);
    return response.data;
  }

  // Completion queries
  async getTodayCompletions(date?: string): Promise<TaskCompletion[]> {
    const params = date ? `?date=${date}` : "";
    const response = await this.request<ApiResponse<TaskCompletion[]>>(
      `/tasks/completions/today${params}`,
    );
    return response.data || [];
  }

  async getCompletionsRange(
    startDate: string,
    endDate: string,
  ): Promise<TaskCompletion[]> {
    const response = await this.request<ApiResponse<TaskCompletion[]>>(
      `/tasks/completions/range?startDate=${startDate}&endDate=${endDate}`,
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
      >("/tasks/reset-day", {
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
    public response?: unknown,
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

  async testGetTasks() {
    console.log("🔍 Testing get tasks...");
    try {
      const tasks = await apiClient.getTasks();
      console.log("✅ Got tasks:", tasks);
      return tasks;
    } catch (error) {
      console.error("❌ Get tasks failed:", error);
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
      await this.testGetTasks();
      console.log("✅ All basic tests passed!");
    } catch (error: unknown) {
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

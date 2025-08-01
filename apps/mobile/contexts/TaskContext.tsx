import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFrequency,
} from "@/types/Task";
import { apiClient, checkApiConnection } from "@/services/api";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
}

type TaskAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ONLINE"; payload: boolean }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "TOGGLE_TASK_LOCAL"; payload: string }
  | { type: "RESET_DAILY_TASKS_LOCAL" };

interface TaskContextType {
  state: TaskState;
  addTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  initFoundationalTasks: () => Promise<void>;
  resetDailyTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_ONLINE":
      return { ...state, isOnline: action.payload };

    case "SET_TASKS":
      return { ...state, tasks: action.payload, loading: false, error: null };

    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        loading: false,
        error: null,
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task,
        ),
        loading: false,
        error: null,
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        loading: false,
        error: null,
      };

    case "TOGGLE_TASK_LOCAL":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? {
                ...task,
                completed: !task.completed,
                completedToday: task.frequency
                  ? !task.completedToday
                  : !task.completed,
                lastCompletedDate:
                  task.frequency && !task.completedToday
                    ? new Date()
                    : task.lastCompletedDate,
                updatedAt: new Date(),
              }
            : task,
        ),
      };

    case "RESET_DAILY_TASKS_LOCAL":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.frequency
            ? { ...task, completedToday: false, updatedAt: new Date() }
            : task,
        ),
      };

    default:
      return state;
  }
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    loading: true,
    error: null,
    isOnline: false,
  });

  // Convert API task to Task interface
  const convertApiTaskToTask = (apiTask: {
    id: string;
    text: string;
    completed?: boolean;
    completedToday?: boolean;
    frequency?: TaskFrequency;
    createdAt: string;
    updatedAt: string;
    lastCompletedAt?: string;
    durationSeconds?: number;
    timerStartedAt?: string;
    timerStatus?: string;
  }): Task => ({
    id: apiTask.id,
    text: apiTask.text,
    completed: apiTask.completed || false,
    completedToday:
      apiTask.frequency === null
        ? apiTask.completed || false
        : apiTask.completedToday || false,
    frequency: apiTask.frequency,
    createdAt: new Date(apiTask.createdAt),
    updatedAt: new Date(apiTask.updatedAt),
    lastCompletedDate: apiTask.lastCompletedAt
      ? new Date(apiTask.lastCompletedAt)
      : undefined,
    durationSeconds: apiTask.durationSeconds,
    timerStartedAt: apiTask.timerStartedAt,
    timerStatus: apiTask.timerStatus as any,
  });

  // Check API connection
  const checkConnection = async () => {
    try {
      const isOnline = await checkApiConnection();
      dispatch({ type: "SET_ONLINE", payload: isOnline });
      return isOnline;
    } catch (error) {
      console.error("Connection check failed:", error);
      dispatch({ type: "SET_ONLINE", payload: false });
      return false;
    }
  };

  // Load tasks from API
  const loadTasks = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const isOnline = await checkConnection();
      if (!isOnline) {
        // No tasks available offline
        dispatch({ type: "SET_TASKS", payload: [] });
        return;
      }

      const apiTasks = await apiClient.getTasks();
      const tasks = apiTasks.map((apiTask: any) =>
        convertApiTaskToTask(apiTask),
      );
      dispatch({ type: "SET_TASKS", payload: tasks });
    } catch (error) {
      console.error("Failed to load tasks:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to load tasks",
      });

      // No tasks available on error
      dispatch({ type: "SET_TASKS", payload: [] });
    }
  };

  // Initialize on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (input: CreateTaskInput) => {
    try {
      // Don't set loading state to prevent screen flicker
      dispatch({ type: "SET_ERROR", payload: null });

      if (!state.isOnline) {
        // Create local task if offline
        const newTask: Task = {
          id: Date.now().toString(),
          text: input.text,
          completed: false,
          completedToday: false,
          frequency: input.frequency,
          createdAt: new Date(),
          updatedAt: new Date(),
          durationSeconds: input.durationSeconds,
        };
        dispatch({ type: "ADD_TASK", payload: newTask });
        return;
      }

      const apiTask = await apiClient.createTask({
        text: input.text,
        frequency: input.frequency as any,
        durationSeconds: input.durationSeconds,
        projectId: input.projectId,
      });

      const newTask = convertApiTaskToTask(apiTask as any);
      dispatch({ type: "ADD_TASK", payload: newTask });
    } catch (error) {
      console.error("Failed to add task:", error);
      // Don't show error in UI to prevent flicker
      console.warn(
        "Task creation failed but not showing error to prevent UI flicker:",
        error,
      );
    }
  };

  const updateTask = async (input: UpdateTaskInput) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      if (!state.isOnline) {
        // Update locally if offline
        const existingTask = state.tasks.find((t) => t.id === input.id);
        if (existingTask) {
          const updatedTask: Task = {
            ...existingTask,
            ...(input.text !== undefined && { text: input.text }),
            ...(input.completed !== undefined && {
              completed: input.completed,
            }),
            ...(input.completedToday !== undefined && {
              completedToday: input.completedToday,
            }),
            ...(input.lastCompletedDate !== undefined && {
              lastCompletedDate: input.lastCompletedDate,
            }),
            updatedAt: new Date(),
          };
          dispatch({ type: "UPDATE_TASK", payload: updatedTask });
        }
        return;
      }

      const apiTask = await apiClient.updateTask(input.id, {
        text: input.text,
        frequency: input.frequency as any,
        completed: input.completed,
      });

      const updatedTask = convertApiTaskToTask(apiTask as any);
      dispatch({ type: "UPDATE_TASK", payload: updatedTask });
    } catch (error) {
      console.error("Failed to update task:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to update task",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Optimistically delete from UI first
      dispatch({ type: "DELETE_TASK", payload: id });

      if (!state.isOnline) {
        console.log("Offline mode: task deleted locally");
        return;
      }

      // Delete from server in background
      await apiClient.deleteTask(id);
      console.log(`Task ${id} deleted from server`);
    } catch (error) {
      console.error("Failed to delete task:", error);
      // Could implement rollback here if needed
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to delete task",
      });
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;

      // Optimistically update UI first - no loading state to prevent flicker
      dispatch({ type: "TOGGLE_TASK_LOCAL", payload: id });

      if (!state.isOnline) {
        console.log("Offline mode: task toggled locally");
        return;
      }

      // If it's a recurring task, use completion API
      if (task.frequency) {
        if (task.completedToday) {
          // Mark as incomplete
          await apiClient.markTaskIncomplete(id);
          console.log(`Task ${task.text} marked as incomplete in database`);
        } else {
          // Mark as complete
          const completion = await apiClient.markTaskComplete(id);
          console.log(
            `Task ${task.text} marked as complete in database:`,
            completion,
          );
        }
      } else {
        // For one-time tasks, call API directly without loading states
        try {
          await apiClient.updateTask(id, {
            text: task.text,
            completed: !task.completed,
          });
          console.log(`One-time task ${task.text} toggled in database`);
        } catch (apiError) {
          console.error("Failed to update one-time task:", apiError);
          throw apiError;
        }
      }
    } catch (error) {
      console.error("Failed to toggle task:", error);
      // Revert optimistic update on error - no loading state to prevent flicker
      dispatch({ type: "TOGGLE_TASK_LOCAL", payload: id });
      // Don't show error in UI for task toggle to prevent flicker
      console.warn(
        "Task toggle failed but not showing error to prevent UI flicker:",
        error,
      );
    }
  };

  const initFoundationalTasks = async () => {
    // This is handled automatically when loading tasks from the API
    await loadTasks();
  };

  const resetDailyTasks = async () => {
    try {
      console.log("🔄 Starting daily tasks reset...");
      console.log("Current online status:", state.isOnline);
      console.log("Current tasks count:", state.tasks.length);

      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      if (!state.isOnline) {
        // Reset locally if offline
        console.log("📱 Offline mode: resetting locally");
        dispatch({ type: "RESET_DAILY_TASKS_LOCAL" });
        console.log("✅ Offline reset complete");
        return;
      }

      console.log("🌐 Online mode: calling API reset");
      const result = await apiClient.resetDay();
      console.log("✅ API reset complete:", result);

      console.log("🔄 Refreshing tasks from server...");
      await refreshTasks();
      console.log("✅ Tasks refreshed successfully");
    } catch (error) {
      console.error("❌ Failed to reset daily tasks:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        isOnline: state.isOnline,
      });

      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? `Reset failed: ${error.message}`
            : "Failed to reset daily tasks",
      });
    }
  };

  const refreshTasks = async () => {
    await loadTasks();
  };

  const value: TaskContextType = {
    state,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    initFoundationalTasks,
    resetDailyTasks,
    refreshTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};

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
  FOUNDATIONAL_HABITS,
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
  | { type: "RESET_DAILY_HABITS_LOCAL" };

interface TaskContextType {
  state: TaskState;
  addTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  initFoundationalHabits: () => Promise<void>;
  resetDailyHabits: () => Promise<void>;
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
                completedToday: task.isFoundational
                  ? !task.completedToday
                  : !task.completed,
                lastCompletedDate:
                  task.isFoundational && !task.completedToday
                    ? new Date()
                    : task.lastCompletedDate,
                updatedAt: new Date(),
              }
            : task,
        ),
      };

    case "RESET_DAILY_HABITS_LOCAL":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.isFoundational
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

  // Convert API habit to Task interface
  const convertApiHabitToTask = (habit: any): Task => ({
    id: habit.id,
    text: habit.text,
    completed: habit.completedToday || false,
    completedToday: habit.completedToday || false,
    isFoundational: habit.isFoundational,
    category: habit.category,
    createdAt: new Date(habit.createdAt),
    updatedAt: new Date(habit.updatedAt),
    lastCompletedDate: habit.lastCompletedAt
      ? new Date(habit.lastCompletedAt)
      : undefined,
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
        // Fallback to local foundational habits if offline
        const localTasks: Task[] = FOUNDATIONAL_HABITS.map((habit, index) => ({
          id: `foundational-${index}`,
          text: habit.text,
          completed: false,
          completedToday: false,
          isFoundational: true,
          category: habit.category,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        dispatch({ type: "SET_TASKS", payload: localTasks });
        return;
      }

      const habits = await apiClient.getHabits();
      const tasks = habits.map(convertApiHabitToTask);
      dispatch({ type: "SET_TASKS", payload: tasks });
    } catch (error) {
      console.error("Failed to load tasks:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to load tasks",
      });

      // Fallback to local foundational habits on error
      const localTasks: Task[] = FOUNDATIONAL_HABITS.map((habit, index) => ({
        id: `foundational-${index}`,
        text: habit.text,
        completed: false,
        completedToday: false,
        isFoundational: true,
        category: habit.category,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      dispatch({ type: "SET_TASKS", payload: localTasks });
    }
  };

  // Initialize on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (input: CreateTaskInput) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      if (!state.isOnline) {
        // Create local task if offline
        const newTask: Task = {
          id: Date.now().toString(),
          text: input.text,
          completed: false,
          completedToday: false,
          isFoundational: input.isFoundational || false,
          category: input.category,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch({ type: "ADD_TASK", payload: newTask });
        return;
      }

      const habit = await apiClient.createHabit({
        text: input.text,
        category: input.category || "personal",
        isFoundational: input.isFoundational,
      });

      const newTask = convertApiHabitToTask(habit);
      dispatch({ type: "ADD_TASK", payload: newTask });
    } catch (error) {
      console.error("Failed to add task:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to add task",
      });
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

      const habit = await apiClient.updateHabit(input.id, {
        text: input.text,
        category: input.category,
      });

      const updatedTask = convertApiHabitToTask(habit);
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
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      if (!state.isOnline) {
        // Delete locally if offline
        dispatch({ type: "DELETE_TASK", payload: id });
        return;
      }

      await apiClient.deleteHabit(id);
      dispatch({ type: "DELETE_TASK", payload: id });
    } catch (error) {
      console.error("Failed to delete task:", error);
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

      // Optimistically update UI first
      dispatch({ type: "TOGGLE_TASK_LOCAL", payload: id });

      if (!state.isOnline) {
        console.log("Offline mode: task toggled locally");
        return;
      }

      // If it's a foundational habit, use completion API
      if (task.isFoundational) {
        if (task.completedToday) {
          // Mark as incomplete
          await apiClient.markHabitIncomplete(id);
          console.log(`Habit ${task.text} marked as incomplete in database`);
        } else {
          // Mark as complete
          const completion = await apiClient.markHabitComplete(id);
          console.log(
            `Habit ${task.text} marked as complete in database:`,
            completion,
          );
        }
      } else {
        // For regular tasks, update via the update API
        await updateTask({
          id,
          completed: !task.completed,
        });
      }

      // Refresh data to get updated state from server
      await refreshTasks();
    } catch (error) {
      console.error("Failed to toggle task:", error);
      // Revert optimistic update on error
      dispatch({ type: "TOGGLE_TASK_LOCAL", payload: id });
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to toggle task",
      });
    }
  };

  const initFoundationalHabits = async () => {
    // This is handled automatically when loading tasks from the API
    await loadTasks();
  };

  const resetDailyHabits = async () => {
    try {
      console.log("🔄 Starting daily habits reset...");
      console.log("Current online status:", state.isOnline);
      console.log("Current tasks count:", state.tasks.length);

      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      if (!state.isOnline) {
        // Reset locally if offline
        console.log("📱 Offline mode: resetting locally");
        dispatch({ type: "RESET_DAILY_HABITS_LOCAL" });
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
      console.error("❌ Failed to reset daily habits:", error);
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
            : "Failed to reset daily habits",
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
    initFoundationalHabits,
    resetDailyHabits,
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

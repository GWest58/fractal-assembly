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

interface TaskState {
  tasks: Task[];
}

type TaskAction =
  | { type: "ADD_TASK"; payload: CreateTaskInput }
  | { type: "UPDATE_TASK"; payload: UpdateTaskInput }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "TOGGLE_TASK"; payload: string }
  | { type: "INIT_FOUNDATIONAL_HABITS" }
  | { type: "RESET_DAILY_HABITS" };

interface TaskContextType {
  state: TaskState;
  addTask: (input: CreateTaskInput) => void;
  updateTask: (input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  initFoundationalHabits: () => void;
  resetDailyHabits: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case "ADD_TASK":
      const newTask: Task = {
        id: Date.now().toString(),
        text: action.payload.text,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFoundational: action.payload.isFoundational || false,
        category: action.payload.category,
        completedToday: false,
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                ...(action.payload.text !== undefined && {
                  text: action.payload.text,
                }),
                ...(action.payload.completed !== undefined && {
                  completed: action.payload.completed,
                }),
                ...(action.payload.completedToday !== undefined && {
                  completedToday: action.payload.completedToday,
                }),
                ...(action.payload.lastCompletedDate !== undefined && {
                  lastCompletedDate: action.payload.lastCompletedDate,
                }),
                updatedAt: new Date(),
              }
            : task,
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };

    case "TOGGLE_TASK":
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

    case "INIT_FOUNDATIONAL_HABITS":
      const existingHabits = state.tasks.filter((task) => task.isFoundational);
      if (existingHabits.length === 0) {
        const foundationalTasks: Task[] = FOUNDATIONAL_HABITS.map(
          (habit, index) => ({
            id: `foundational-${index}`,
            text: habit.text,
            completed: false,
            completedToday: false,
            isFoundational: true,
            category: habit.category,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
        return {
          ...state,
          tasks: [...foundationalTasks, ...state.tasks],
        };
      }
      return state;

    case "RESET_DAILY_HABITS":
      console.log("Resetting daily habits...");
      const resetTasks = state.tasks.map((task) =>
        task.isFoundational
          ? { ...task, completedToday: false, updatedAt: new Date() }
          : task,
      );
      console.log(
        "Reset complete. Foundational tasks:",
        resetTasks.filter((t) => t.isFoundational),
      );
      return {
        ...state,
        tasks: resetTasks,
      };

    default:
      return state;
  }
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, { tasks: [] });

  useEffect(() => {
    // Initialize foundational habits on first load
    dispatch({ type: "INIT_FOUNDATIONAL_HABITS" });
  }, []);

  const addTask = (input: CreateTaskInput) => {
    dispatch({ type: "ADD_TASK", payload: input });
  };

  const updateTask = (input: UpdateTaskInput) => {
    dispatch({ type: "UPDATE_TASK", payload: input });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: "DELETE_TASK", payload: id });
  };

  const toggleTask = (id: string) => {
    dispatch({ type: "TOGGLE_TASK", payload: id });
  };

  const initFoundationalHabits = () => {
    dispatch({ type: "INIT_FOUNDATIONAL_HABITS" });
  };

  const resetDailyHabits = () => {
    console.log("resetDailyHabits called");
    dispatch({ type: "RESET_DAILY_HABITS" });
  };

  const value: TaskContextType = {
    state,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    initFoundationalHabits,
    resetDailyHabits,
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

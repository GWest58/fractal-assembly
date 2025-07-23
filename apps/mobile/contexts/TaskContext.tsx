import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/Task';

interface TaskState {
  tasks: Task[];
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: CreateTaskInput }
  | { type: 'UPDATE_TASK'; payload: UpdateTaskInput }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string };

interface TaskContextType {
  state: TaskState;
  addTask: (input: CreateTaskInput) => void;
  updateTask: (input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'ADD_TASK':
      const newTask: Task = {
        id: Date.now().toString(),
        text: action.payload.text,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? {
                ...task,
                ...(action.payload.text !== undefined && { text: action.payload.text }),
                ...(action.payload.completed !== undefined && { completed: action.payload.completed }),
                updatedAt: new Date(),
              }
            : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: new Date() }
            : task
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
  const [state, dispatch] = useReducer(taskReducer, { tasks: [] });

  const addTask = (input: CreateTaskInput) => {
    dispatch({ type: 'ADD_TASK', payload: input });
  };

  const updateTask = (input: UpdateTaskInput) => {
    dispatch({ type: 'UPDATE_TASK', payload: input });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const toggleTask = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  };

  const value: TaskContextType = {
    state,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

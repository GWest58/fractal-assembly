export type FrequencyType =
  | "daily"
  | "weekly"
  | "monthly"
  | "specific_days"
  | "times_per_week"
  | "times_per_month";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface FrequencyData {
  // For specific_days: array of days
  days?: DayOfWeek[];
  // For times_per_week or times_per_month: number of times
  count?: number;
  // For monthly: specific dates of the month
  dates?: number[];
}

export interface TaskFrequency {
  type: FrequencyType;
  data: FrequencyData;
  time?: string; // HH:MM format
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedToday?: boolean;
  lastCompletedDate?: Date;
  frequency?: TaskFrequency;
}

export type CreateTaskInput = {
  text: string;
  frequency?: TaskFrequency;
};

export type UpdateTaskInput = {
  id: string;
  text?: string;
  completed?: boolean;
  completedToday?: boolean;
  lastCompletedDate?: Date;
  frequency?: TaskFrequency;
};

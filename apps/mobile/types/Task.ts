export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  isFoundational?: boolean;
  category?: "health" | "wellness" | "productivity" | "personal";
  completedToday?: boolean;
  lastCompletedDate?: Date;
}

export type CreateTaskInput = {
  text: string;
  isFoundational?: boolean;
  category?: "health" | "wellness" | "productivity" | "personal";
};

export type UpdateTaskInput = {
  id: string;
  text?: string;
  completed?: boolean;
  completedToday?: boolean;
  lastCompletedDate?: Date;
};

export const FOUNDATIONAL_HABITS = [
  { text: "Make bed", category: "personal" as const },
  { text: "Take meds", category: "health" as const },
  { text: "Meditate 5 minutes", category: "wellness" as const },
  { text: "Go for a walk", category: "health" as const },
  { text: "Daily check-in", category: "productivity" as const },
];

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTaskInput = {
  text: string;
};

export type UpdateTaskInput = {
  id: string;
  text?: string;
  completed?: boolean;
};

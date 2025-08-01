export interface Goal {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  projectCount?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  goalId?: string;
  goalName?: string;
  createdAt: Date;
  updatedAt: Date;
  taskCount?: number;
}

export type CreateGoalInput = {
  name: string;
  description?: string;
};

export type UpdateGoalInput = {
  id: string;
  name?: string;
  description?: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  goalId?: string;
};

export type UpdateProjectInput = {
  id: string;
  name?: string;
  description?: string;
  goalId?: string;
};

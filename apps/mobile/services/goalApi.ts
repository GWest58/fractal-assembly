import { Goal, CreateGoalInput, UpdateGoalInput, Project } from "@/types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export class GoalApiService {
  private baseUrl = `${API_BASE_URL}/api/goals`;

  async getAllGoals(): Promise<Goal[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
      }));
    } catch (error) {
      console.error("Error fetching goals:", error);
      throw error;
    }
  }

  async getGoalById(id: string): Promise<Goal> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error("Error fetching goal:", error);
      throw error;
    }
  }

  async getGoalProjects(id: string): Promise<Project[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/projects`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
      }));
    } catch (error) {
      console.error("Error fetching goal projects:", error);
      throw error;
    }
  }

  async createGoal(goalData: CreateGoalInput): Promise<Goal> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error("Error creating goal:", error);
      throw error;
    }
  }

  async updateGoal(goalData: UpdateGoalInput): Promise<Goal> {
    try {
      const response = await fetch(`${this.baseUrl}/${goalData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  }

  async deleteGoal(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw error;
    }
  }
}

export const goalApi = new GoalApiService();

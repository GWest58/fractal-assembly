import { Project, CreateProjectInput, UpdateProjectInput, Task } from "@/types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export class ProjectApiService {
  private baseUrl = `${API_BASE_URL}/api/projects`;

  async getAllProjects(goalId?: string): Promise<Project[]> {
    try {
      const url = goalId ? `${this.baseUrl}?goal_id=${goalId}` : this.baseUrl;
      const response = await fetch(url);
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
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  async getProjectById(id: string): Promise<Project> {
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
      console.error("Error fetching project:", error);
      throw error;
    }
  }

  async getProjectTasks(id: string): Promise<Task[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/tasks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      throw error;
    }
  }

  async createProject(projectData: CreateProjectInput): Promise<Project> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
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
      console.error("Error creating project:", error);
      throw error;
    }
  }

  async updateProject(projectData: UpdateProjectInput): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
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
      console.error("Error updating project:", error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }
}

export const projectApi = new ProjectApiService();

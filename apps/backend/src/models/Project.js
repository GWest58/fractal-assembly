import database from "./database.js";
import { v4 as uuidv4 } from "uuid";

class Project {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.goalId = data.goal_id || data.goalId;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // Static methods for database operations
  static async getAll() {
    const sql = `
      SELECT p.*, g.name as goal_name
      FROM projects p
      LEFT JOIN goals g ON p.goal_id = g.id
      ORDER BY p.created_at DESC
    `;
    const rows = await database.all(sql);
    return rows.map((row) => {
      const project = new Project(row);
      project.goalName = row.goal_name;
      return project;
    });
  }

  static async getByGoalId(goalId) {
    const sql = `
      SELECT * FROM projects
      WHERE goal_id = ?
      ORDER BY created_at DESC
    `;
    const rows = await database.all(sql, [goalId]);
    return rows.map((row) => new Project(row));
  }

  static async getById(id) {
    const sql = `
      SELECT p.*, g.name as goal_name
      FROM projects p
      LEFT JOIN goals g ON p.goal_id = g.id
      WHERE p.id = ?
    `;
    const row = await database.get(sql, [id]);
    if (row) {
      const project = new Project(row);
      project.goalName = row.goal_name;
      return project;
    }
    return null;
  }

  static async create(data) {
    const id = data.id || uuidv4();

    const sql = `
      INSERT INTO projects (id, name, description, goal_id)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      id,
      data.name,
      data.description || null,
      data.goalId || null,
    ];

    await database.run(sql, params);
    return await Project.getById(id);
  }

  static async update(id, data) {
    const sql = `
      UPDATE projects
      SET name = ?, description = ?, goal_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [
      data.name,
      data.description,
      data.goalId,
      id,
    ];

    await database.run(sql, params);
    return await Project.getById(id);
  }

  static async delete(id) {
    // First check if project has any tasks
    const taskCheckSql = "SELECT COUNT(*) as count FROM tasks WHERE project_id = ?";
    const taskCount = await database.get(taskCheckSql, [id]);

    if (taskCount.count > 0) {
      throw new Error("Cannot delete project that has tasks. Please delete or reassign tasks first.");
    }

    const sql = "DELETE FROM projects WHERE id = ?";
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  // Get goal associated with this project
  async getGoal() {
    if (!this.goalId) return null;

    const sql = "SELECT * FROM goals WHERE id = ?";
    const row = await database.get(sql, [this.goalId]);

    if (row) {
      // Import Goal class dynamically to avoid circular imports
      const { default: Goal } = await import("./Goal.js");
      return new Goal(row);
    }
    return null;
  }

  // Get tasks associated with this project
  async getTasks() {
    const sql = `
      SELECT * FROM tasks
      WHERE project_id = ?
      ORDER BY created_at DESC
    `;
    const rows = await database.all(sql, [this.id]);

    // Import Task class dynamically to avoid circular imports
    const { default: Task } = await import("./Task.js");
    return rows.map((row) => new Task(row));
  }

  // Get task count for this project
  async getTaskCount() {
    const sql = "SELECT COUNT(*) as count FROM tasks WHERE project_id = ?";
    const result = await database.get(sql, [this.id]);
    return result.count;
  }

  // Instance methods
  async save() {
    if (this.id) {
      return await Project.update(this.id, this);
    } else {
      return await Project.create(this);
    }
  }

  async delete() {
    return await Project.delete(this.id);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      goalId: this.goalId,
      goalName: this.goalName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Project;

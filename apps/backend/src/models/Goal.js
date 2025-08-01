import database from "./database.js";
import { v4 as uuidv4 } from "uuid";

class Goal {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // Static methods for database operations
  static async getAll() {
    const sql = `
      SELECT * FROM goals
      ORDER BY created_at DESC
    `;
    const rows = await database.all(sql);
    return rows.map((row) => new Goal(row));
  }

  static async getById(id) {
    const sql = "SELECT * FROM goals WHERE id = ?";
    const row = await database.get(sql, [id]);
    return row ? new Goal(row) : null;
  }

  static async create(data) {
    const id = data.id || uuidv4();

    const sql = `
      INSERT INTO goals (id, name, description)
      VALUES (?, ?, ?)
    `;
    const params = [
      id,
      data.name,
      data.description || null,
    ];

    await database.run(sql, params);
    return await Goal.getById(id);
  }

  static async update(id, data) {
    const sql = `
      UPDATE goals
      SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [
      data.name,
      data.description,
      id,
    ];

    await database.run(sql, params);
    return await Goal.getById(id);
  }

  static async delete(id) {
    // First check if goal has any projects
    const projectCheckSql = "SELECT COUNT(*) as count FROM projects WHERE goal_id = ?";
    const projectCount = await database.get(projectCheckSql, [id]);

    if (projectCount.count > 0) {
      throw new Error("Cannot delete goal that has projects. Please delete or reassign projects first.");
    }

    const sql = "DELETE FROM goals WHERE id = ?";
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  // Get projects associated with this goal
  async getProjects() {
    const sql = `
      SELECT * FROM projects
      WHERE goal_id = ?
      ORDER BY created_at DESC
    `;
    const rows = await database.all(sql, [this.id]);

    // Import Project class dynamically to avoid circular imports
    const { default: Project } = await import("./Project.js");
    return rows.map((row) => new Project(row));
  }

  // Get project count for this goal
  async getProjectCount() {
    const sql = "SELECT COUNT(*) as count FROM projects WHERE goal_id = ?";
    const result = await database.get(sql, [this.id]);
    return result.count;
  }

  // Instance methods
  async save() {
    if (this.id) {
      return await Goal.update(this.id, this);
    } else {
      return await Goal.create(this);
    }
  }

  async delete() {
    return await Goal.delete(this.id);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Goal;

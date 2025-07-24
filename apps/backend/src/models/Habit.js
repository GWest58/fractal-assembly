import database from './database.js';
import { v4 as uuidv4 } from 'uuid';

class Habit {
  constructor(data) {
    this.id = data.id;
    this.text = data.text;
    this.category = data.category;
    this.isFoundational = data.is_foundational || data.isFoundational;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // Static methods for database operations
  static async getAll() {
    const sql = `
      SELECT * FROM habits
      WHERE is_foundational = 1
      ORDER BY created_at ASC
    `;
    const rows = await database.all(sql);
    return rows.map(row => new Habit(row));
  }

  static async getById(id) {
    const sql = 'SELECT * FROM habits WHERE id = ?';
    const row = await database.get(sql, [id]);
    return row ? new Habit(row) : null;
  }

  static async create(data) {
    const id = data.id || uuidv4();
    const sql = `
      INSERT INTO habits (id, text, category, is_foundational)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      id,
      data.text,
      data.category,
      data.isFoundational ? 1 : 0
    ];

    await database.run(sql, params);
    return await Habit.getById(id);
  }

  static async update(id, data) {
    const sql = `
      UPDATE habits
      SET text = ?, category = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [data.text, data.category, id];
    await database.run(sql, params);
    return await Habit.getById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM habits WHERE id = ?';
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  // Completion tracking methods
  static async markComplete(habitId, completedAt = new Date()) {
    const completionDate = completedAt.toISOString().split('T')[0]; // YYYY-MM-DD
    const completionId = uuidv4();

    const sql = `
      INSERT OR REPLACE INTO habit_completions
      (id, habit_id, completed_at, completion_date)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      completionId,
      habitId,
      completedAt.toISOString(),
      completionDate
    ];

    await database.run(sql, params);
    return {
      id: completionId,
      habitId,
      completedAt: completedAt.toISOString(),
      completionDate
    };
  }

  static async markIncomplete(habitId, date = new Date()) {
    const completionDate = date.toISOString().split('T')[0];
    const sql = `
      DELETE FROM habit_completions
      WHERE habit_id = ? AND completion_date = ?
    `;
    const result = await database.run(sql, [habitId, completionDate]);
    return result.changes > 0;
  }

  static async getCompletionsForDate(date = new Date()) {
    const completionDate = date.toISOString().split('T')[0];
    const sql = `
      SELECT hc.*, h.text, h.category
      FROM habit_completions hc
      JOIN habits h ON hc.habit_id = h.id
      WHERE hc.completion_date = ?
      ORDER BY hc.completed_at ASC
    `;
    return await database.all(sql, [completionDate]);
  }

  static async getCompletionsForDateRange(startDate, endDate) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    const sql = `
      SELECT hc.*, h.text, h.category
      FROM habit_completions hc
      JOIN habits h ON hc.habit_id = h.id
      WHERE hc.completion_date BETWEEN ? AND ?
      ORDER BY hc.completion_date DESC, hc.completed_at ASC
    `;
    return await database.all(sql, [start, end]);
  }

  static async isCompletedToday(habitId, date = new Date()) {
    const completionDate = date.toISOString().split('T')[0];
    const sql = `
      SELECT COUNT(*) as count
      FROM habit_completions
      WHERE habit_id = ? AND completion_date = ?
    `;
    const result = await database.get(sql, [habitId, completionDate]);
    return result.count > 0;
  }

  static async getHabitsWithTodayStatus(date = new Date()) {
    const completionDate = date.toISOString().split('T')[0];
    const sql = `
      SELECT
        h.*,
        CASE WHEN hc.id IS NOT NULL THEN 1 ELSE 0 END as completed_today,
        hc.completed_at as last_completed_at
      FROM habits h
      LEFT JOIN habit_completions hc ON h.id = hc.habit_id AND hc.completion_date = ?
      WHERE h.is_foundational = 1
      ORDER BY h.created_at ASC
    `;
    const rows = await database.all(sql, [completionDate]);

    return rows.map(row => ({
      id: row.id,
      text: row.text,
      category: row.category,
      isFoundational: Boolean(row.is_foundational),
      completedToday: Boolean(row.completed_today),
      lastCompletedAt: row.last_completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  static async getStreakForHabit(habitId) {
    const sql = `
      SELECT completion_date
      FROM habit_completions
      WHERE habit_id = ?
      ORDER BY completion_date DESC
    `;
    const completions = await database.all(sql, [habitId]);

    if (completions.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const completion of completions) {
      const completionDate = completion.completion_date;
      const expectedDate = currentDate.toISOString().split('T')[0];

      if (completionDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  static async getCompletionStats(habitId, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sql = `
      SELECT COUNT(*) as completed_days
      FROM habit_completions
      WHERE habit_id = ?
      AND completion_date BETWEEN ? AND ?
    `;
    const params = [
      habitId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ];

    const result = await database.get(sql, params);
    const completedDays = result.completed_days;
    const completionRate = Math.round((completedDays / days) * 100);

    return {
      totalDays: days,
      completedDays,
      completionRate,
      streak: await Habit.getStreakForHabit(habitId)
    };
  }

  // Instance methods
  async save() {
    if (this.id) {
      return await Habit.update(this.id, this);
    } else {
      return await Habit.create(this);
    }
  }

  async delete() {
    return await Habit.delete(this.id);
  }

  async markCompleteToday() {
    return await Habit.markComplete(this.id);
  }

  async markIncompleteToday() {
    return await Habit.markIncomplete(this.id);
  }

  async isCompletedToday() {
    return await Habit.isCompletedToday(this.id);
  }

  async getStats(days = 30) {
    return await Habit.getCompletionStats(this.id, days);
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      category: this.category,
      isFoundational: this.isFoundational,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Habit;

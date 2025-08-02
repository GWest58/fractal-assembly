import database from "./database.js";
import { v4 as uuidv4 } from "uuid";

class Task {
  constructor(data) {
    this.id = data.id;
    this.text = data.text;
    this.completed = Boolean(data.completed);
    this.projectId = data.project_id || data.projectId;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    this.frequency = this._parseFrequency(data);
    this.durationSeconds = data.duration_seconds || data.durationSeconds;
    this.timerStartedAt = data.timer_started_at || data.timerStartedAt;
    this.timerStatus = data.timer_status || data.timerStatus || "not_started";
  }

  _parseFrequency(data) {
    // Don't default to "daily" - null/undefined frequency_type means one-time task
    const frequencyType = data.frequency_type;
    let frequencyData = {};

    try {
      frequencyData = data.frequency_data
        ? JSON.parse(data.frequency_data)
        : {};
    } catch {
      frequencyData = {};
    }

    // If no frequency type, return null for one-time tasks
    if (!frequencyType) {
      return null;
    }

    return {
      type: frequencyType,
      data: frequencyData,
      time: data.frequency_time || null,
    };
  }

  // Static methods for database operations
  static async getAll() {
    const sql = `
      SELECT * FROM tasks
      ORDER BY created_at ASC
    `;
    const rows = await database.all(sql);
    return rows.map((row) => new Task(row));
  }

  static async getAllActive(date = new Date()) {
    const sql = `
      SELECT * FROM tasks
      ORDER BY created_at ASC
    `;
    const rows = await database.all(sql);
    const tasks = rows.map((row) => new Task(row));

    // Filter tasks based on their frequency for the given date
    return tasks.filter((task) => task.isActiveOnDate(date));
  }

  static async getById(id) {
    const sql = "SELECT * FROM tasks WHERE id = ?";
    const row = await database.get(sql, [id]);
    return row ? new Task(row) : null;
  }

  static async create(data) {
    const id = data.id || uuidv4();
    const frequency = data.frequency; // Don't default to daily for one-time tasks

    const sql = `
      INSERT INTO tasks (id, text, project_id, frequency_type, frequency_data, frequency_time, completed, duration_seconds, timer_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.text,
      data.projectId || null,
      frequency ? frequency.type : null,
      frequency ? JSON.stringify(frequency.data) : null,
      frequency ? frequency.time : null,
      data.completed ? 1 : 0,
      data.durationSeconds || null,
      "not_started",
    ];

    await database.run(sql, params);
    return await Task.getById(id);
  }

  static async update(id, data) {
    let sql = `
      UPDATE tasks
      SET text = ?, updated_at = CURRENT_TIMESTAMP
    `;
    let params = [data.text];

    if (data.projectId !== undefined) {
      sql += `, project_id = ?`;
      params.push(data.projectId);
    }

    if (data.frequency !== undefined) {
      sql += `, frequency_type = ?, frequency_data = ?, frequency_time = ?`;
      params.push(
        data.frequency ? data.frequency.type : null,
        data.frequency ? JSON.stringify(data.frequency.data) : null,
        data.frequency ? data.frequency.time : null,
      );
    }

    if (data.completed !== undefined) {
      sql += `, completed = ?`;
      params.push(data.completed ? 1 : 0);
    }

    if (data.durationSeconds !== undefined) {
      sql += `, duration_seconds = ?`;
      params.push(data.durationSeconds);
    }

    if (data.timerStartedAt !== undefined) {
      sql += `, timer_started_at = ?`;
      params.push(data.timerStartedAt);
    }

    if (data.timerStatus !== undefined) {
      sql += `, timer_status = ?`;
      params.push(data.timerStatus);
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    await database.run(sql, params);
    return await Task.getById(id);
  }

  static async delete(id) {
    const sql = "DELETE FROM tasks WHERE id = ?";
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  // Completion tracking methods
  static async markComplete(taskId, completedAt = new Date()) {
    const completionId = uuidv4();

    const sql = `
      INSERT OR REPLACE INTO task_completions
      (id, task_id, completed_at)
      VALUES (?, ?, ?)
    `;
    const params = [completionId, taskId, completedAt.toISOString()];

    await database.run(sql, params);
    return {
      id: completionId,
      taskId,
      completedAt: completedAt.toISOString(),
    };
  }

  static async markIncomplete(taskId, startOfDay, endOfDay) {
    const sql = `
      DELETE FROM task_completions
      WHERE task_id = ? AND completed_at >= ? AND completed_at < ?
    `;
    const result = await database.run(sql, [taskId, startOfDay, endOfDay]);
    return result.changes > 0;
  }

  static async getCompletionsForDate(startOfDay, endOfDay) {
    const sql = `
      SELECT tc.*, t.text
      FROM task_completions tc
      JOIN tasks t ON tc.task_id = t.id
      WHERE tc.completed_at >= ? AND tc.completed_at < ?
      ORDER BY tc.completed_at ASC
    `;
    return await database.all(sql, [startOfDay, endOfDay]);
  }

  static async getCompletionsForDateRange(startOfPeriod, endOfPeriod) {
    const sql = `
      SELECT tc.*, t.text
      FROM task_completions tc
      JOIN tasks t ON tc.task_id = t.id
      WHERE tc.completed_at >= ? AND tc.completed_at < ?
      ORDER BY tc.completed_at DESC
    `;
    return await database.all(sql, [startOfPeriod, endOfPeriod]);
  }

  static async isCompletedToday(taskId, startOfDay, endOfDay) {
    const sql = `
      SELECT COUNT(*) as count
      FROM task_completions
      WHERE task_id = ? AND completed_at >= ? AND completed_at < ?
    `;
    const result = await database.get(sql, [taskId, startOfDay, endOfDay]);
    return result.count > 0;
  }

  static async getTasksWithTodayStatus(startOfDay, endOfDay) {
    const sql = `
      SELECT
        t.id,
        t.text,
        t.project_id,
        t.frequency_type,
        t.frequency_data,
        t.frequency_time,
        t.completed,
        t.created_at,
        t.updated_at,
        t.duration_seconds,
        t.timer_started_at,
        t.timer_status,
        CASE WHEN tc.id IS NOT NULL THEN 1 ELSE 0 END as completed_today,
        tc.completed_at as last_completed_at
      FROM tasks t
      LEFT JOIN task_completions tc ON t.id = tc.task_id AND tc.completed_at >= ? AND tc.completed_at < ?
      ORDER BY t.created_at ASC
    `;
    const rows = await database.all(sql, [startOfDay, endOfDay]);

    const tasks = rows.map((row) => new Task(row));

    // Filter tasks based on their frequency and return with status
    // For date filtering, we'll use the current date since we're already filtering by time range
    const currentDate = new Date();
    return tasks
      .filter((task) => task.isActiveOnDate(currentDate))
      .map((task) => {
        const taskRow = rows.find((r) => r.id === task.id);

        // For one-time tasks, use the completed field instead of completion tracking
        const completedToday =
          task.frequency === null
            ? task.completed
            : Boolean(taskRow?.completed_today);

        return {
          id: task.id,
          text: task.text,
          completed: task.completed, // Add completed field for one-time tasks
          projectId: task.projectId,
          completedToday: completedToday,
          lastCompletedAt: taskRow?.last_completed_at,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          frequency: task.frequency,
          durationSeconds: task.durationSeconds,
          timerStartedAt: task.timerStartedAt,
          timerStatus: task.timerStatus,
        };
      });
  }

  static async getStreakForTask(taskId) {
    const sql = `
      SELECT DATE(completed_at) as completion_date
      FROM task_completions
      WHERE task_id = ?
      GROUP BY DATE(completed_at)
      ORDER BY completion_date DESC
    `;
    const completions = await database.all(sql, [taskId]);

    if (completions.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let currentDate = new Date(today);

    for (const completion of completions) {
      const completionDate = completion.completion_date;
      const expectedDate = currentDate.toISOString().split("T")[0];

      if (completionDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  static async getCompletionStats(taskId, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sql = `
      SELECT COUNT(DISTINCT DATE(completed_at)) as completed_days
      FROM task_completions
      WHERE task_id = ?
      AND completed_at >= ? AND completed_at < ?
    `;
    const params = [taskId, startDate.toISOString(), endDate.toISOString()];

    const result = await database.get(sql, params);
    const completedDays = result.completed_days;
    const completionRate = Math.round((completedDays / days) * 100);

    return {
      totalDays: days,
      completedDays,
      completionRate,
      streak: await Task.getStreakForTask(taskId),
    };
  }

  // Frequency checking methods
  isActiveOnDate(date = new Date()) {
    // One-time tasks are always active (no frequency restrictions)
    if (!this.frequency) {
      return true;
    }

    const { type, data } = this.frequency;
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDayName = dayNames[dayOfWeek];

    switch (type) {
      case "daily":
        return true;

      case "specific_days":
        return data.days && data.days.includes(currentDayName);

      case "weekly":
        // For weekly tasks, check if it's the specified day
        return data.days && data.days.includes(currentDayName);

      case "times_per_week":
        // For times per week, we need to check completion history
        // For now, return true (will be refined with completion tracking)
        return true;

      case "times_per_month":
        // For times per month, check if we haven't exceeded the count
        return true;

      case "monthly":
        // Check if today's date is in the specified dates
        const today = date.getDate();
        return data.dates && data.dates.includes(today);

      default:
        return true;
    }
  }

  shouldShowNotification(date = new Date()) {
    if (!this.isActiveOnDate(date)) return false;

    // One-time tasks don't have scheduled notifications
    if (!this.frequency) return false;

    if (this.frequency.time) {
      const [hours, minutes] = this.frequency.time.split(":").map(Number);
      const notificationTime = new Date(date);
      notificationTime.setHours(hours, minutes, 0, 0);

      // Show notification at the specified time
      return Math.abs(date.getTime() - notificationTime.getTime()) < 60000; // Within 1 minute
    }

    return this.isActiveOnDate(date);
  }

  // Instance methods
  async save() {
    if (this.id) {
      return await Task.update(this.id, this);
    } else {
      return await Task.create(this);
    }
  }

  async delete() {
    return await Task.delete(this.id);
  }

  async markCompleteToday() {
    return await Task.markComplete(this.id);
  }

  async markIncompleteToday() {
    return await Task.markIncomplete(this.id);
  }

  async isCompletedToday(startOfDay, endOfDay) {
    return await Task.isCompletedToday(this.id, startOfDay, endOfDay);
  }

  async getStats(days = 30) {
    return await Task.getCompletionStats(this.id, days);
  }

  // Timer management methods
  static async startTimer(taskId) {
    const task = await Task.getById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (!task.durationSeconds) {
      throw new Error("Task has no duration set");
    }

    const startedAt = new Date().toISOString();
    await Task.update(taskId, {
      text: task.text,
      timerStartedAt: startedAt,
      timerStatus: "running",
    });

    return await Task.getById(taskId);
  }

  static async pauseTimer(taskId) {
    const task = await Task.getById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.timerStatus !== "running") {
      throw new Error("Timer is not running");
    }

    await Task.update(taskId, {
      text: task.text,
      timerStatus: "paused",
    });

    return await Task.getById(taskId);
  }

  static async stopTimer(taskId) {
    const task = await Task.getById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    await Task.update(taskId, {
      text: task.text,
      timerStartedAt: null,
      timerStatus: "not_started",
    });

    return await Task.getById(taskId);
  }

  static async getTimerStatus(taskId) {
    const task = await Task.getById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const now = new Date();
    let remainingSeconds = null;
    let elapsed = 0;

    if (task.timerStartedAt && task.durationSeconds) {
      const startTime = new Date(task.timerStartedAt);
      elapsed = Math.floor((now - startTime) / 1000);
      remainingSeconds = Math.max(0, task.durationSeconds - elapsed);

      // Auto-complete if timer has expired AND it expired recently (within last hour)
      // This prevents old "running" timers from auto-completing inappropriately
      const timeSinceExpiry = elapsed - task.durationSeconds;
      const expiredRecently = timeSinceExpiry <= 3600; // 1 hour in seconds

      if (
        remainingSeconds === 0 &&
        task.timerStatus === "running" &&
        expiredRecently
      ) {
        console.log(
          `Timer expired recently for task ${task.text}, auto-completing...`,
        );
        // Mark task as completed
        if (task.frequency) {
          await Task.markComplete(taskId);
        } else {
          await Task.update(taskId, {
            text: task.text,
            completed: true,
            timerStatus: "completed",
          });
        }
      } else if (
        remainingSeconds === 0 &&
        task.timerStatus === "running" &&
        !expiredRecently
      ) {
        // Timer expired long ago, just update status without completing task
        console.log(
          `Timer expired long ago for task ${task.text}, stopping timer without completion...`,
        );
        await Task.update(taskId, {
          text: task.text,
          timerStatus: "not_started",
          timerStartedAt: null,
        });
      }
    }

    return {
      taskId,
      status: task.timerStatus,
      durationSeconds: task.durationSeconds,
      startedAt: task.timerStartedAt,
      elapsed,
      remainingSeconds,
      isExpired: remainingSeconds === 0 && task.timerStatus === "running",
    };
  }

  // Instance timer methods
  async startTimer() {
    return await Task.startTimer(this.id);
  }

  async pauseTimer() {
    return await Task.pauseTimer(this.id);
  }

  async stopTimer() {
    return await Task.stopTimer(this.id);
  }

  async getTimerStatus() {
    return await Task.getTimerStatus(this.id);
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      completed: this.completed,
      projectId: this.projectId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      frequency: this.frequency,
      durationSeconds: this.durationSeconds,
      timerStartedAt: this.timerStartedAt,
      timerStatus: this.timerStatus,
    };
  }
}

export default Task;

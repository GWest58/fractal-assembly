import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

// GET /api/tasks - Get all tasks with today's completion status
router.get("/", async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const tasks = await Task.getTasksWithTodayStatus(date);
    res.json({
      success: true,
      data: tasks,
      date: date.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tasks",
      message: error.message,
    });
  }
});

// GET /api/tasks/:id - Get a specific task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.getById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }
    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch task",
      message: error.message,
    });
  }
});

// POST /api/tasks - Create a new task
router.post("/", async (req, res) => {
  try {
    const { text, frequency } = req.body;

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Task text is required",
      });
    }

    const taskData = {
      text: text.trim(),
      frequency: frequency, // Don't default to daily for one-time tasks
    };

    const task = await Task.create(taskData);
    res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create task",
      message: error.message,
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put("/:id", async (req, res) => {
  try {
    const { text, frequency, completed } = req.body;
    const taskId = req.params.id;

    // Check if task exists
    const existingTask = await Task.getById(taskId);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Build update data object
    const updateData = {};

    // Only update text if provided and valid
    if (text !== undefined) {
      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: "Task text cannot be empty",
        });
      }
      updateData.text = text.trim();
    } else {
      // Only set text if we're updating other fields that require it
      if (frequency !== undefined || completed === undefined) {
        updateData.text = existingTask.text;
      }
    }

    // Handle frequency updates
    if (frequency !== undefined) {
      updateData.frequency = frequency;
    } else {
      updateData.frequency = existingTask.frequency;
    }

    // Handle completed field for one-time tasks
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    const updatedTask = await Task.update(taskId, updateData);
    res.json({
      success: true,
      data: updatedTask,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update task",
      message: error.message,
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.getById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    const deleted = await Task.delete(taskId);
    if (deleted) {
      res.json({
        success: true,
        message: "Task deleted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to delete task",
      });
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete task",
      message: error.message,
    });
  }
});

// POST /api/tasks/:id/complete - Mark task as completed for today
router.post("/:id/complete", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { completedAt } = req.body;

    // Check if task exists
    const task = await Task.getById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    const completionTime = completedAt ? new Date(completedAt) : new Date();
    const completion = await Task.markComplete(taskId, completionTime);

    res.json({
      success: true,
      data: completion,
      message: "Task marked as completed",
    });
  } catch (error) {
    console.error("Error marking task complete:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark task as completed",
      message: error.message,
    });
  }
});

// DELETE /api/tasks/:id/complete - Mark task as incomplete for today
router.delete("/:id/complete", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { date } = req.query;

    // Check if task exists
    const task = await Task.getById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    const targetDate = date ? new Date(date) : new Date();
    const removed = await Task.markIncomplete(taskId, targetDate);

    if (removed) {
      res.json({
        success: true,
        message: "Task marked as incomplete",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "No completion found for this date",
      });
    }
  } catch (error) {
    console.error("Error marking task incomplete:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark task as incomplete",
      message: error.message,
    });
  }
});

// GET /api/tasks/:id/stats - Get completion statistics for a task
router.get("/:id/stats", async (req, res) => {
  try {
    const taskId = req.params.id;
    const days = parseInt(req.query.days) || 30;

    // Check if task exists
    const task = await Task.getById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    const stats = await Task.getCompletionStats(taskId, days);
    res.json({
      success: true,
      data: {
        task: task.toJSON(),
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching task stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch task statistics",
      message: error.message,
    });
  }
});

// GET /api/tasks/completions/today - Get all completions for today
router.get("/completions/today", async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const completions = await Task.getCompletionsForDate(date);

    res.json({
      success: true,
      data: completions,
      date: date.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error fetching today's completions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch completions",
      message: error.message,
    });
  }
});

// GET /api/tasks/completions/range - Get completions for a date range
router.get("/completions/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Both startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const completions = await Task.getCompletionsForDateRange(start, end);

    res.json({
      success: true,
      data: completions,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error fetching completions range:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch completions",
      message: error.message,
    });
  }
});

// POST /api/tasks/reset-day - Reset all recurring tasks for the day
router.post("/reset-day", async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const completionDate = targetDate.toISOString().split("T")[0];

    // Get all tasks
    const tasks = await Task.getAll();

    // Remove all completions for the target date
    const promises = tasks.map((task) =>
      Task.markIncomplete(task.id, targetDate),
    );
    await Promise.all(promises);

    res.json({
      success: true,
      data: {
        resetCount: tasks.length,
        date: completionDate,
      },
      message: `All recurring tasks reset for ${completionDate}`,
    });
  } catch (error) {
    console.error("Error resetting day:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset day",
      message: error.message,
    });
  }
});

export default router;
